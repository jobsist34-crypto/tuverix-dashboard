import type { ControlPoint } from '@/lib/supabase';

function formatSAR(value: number) {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime() {
  return new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date());
}

const severityColors: Record<string, string> = {
  'حرج': '#dc2626',
  'عالي': '#d97706',
  'متوسط': '#0284c7',
  'منخفض': '#16a34a',
};

export function generateAuditReport(
  controlPoints: ControlPoint[],
  stats: {
    authorities: number;
    controlPoints: number;
    complianceRate: string;
    openAlerts: number;
  }
) {
  const reportDate = formatDateTime();
  const totalFines = controlPoints.reduce(
    (sum, cp) => sum + Number(cp.fine_estimate_sar),
    0
  );

  const tableRows = controlPoints
    .map(
      (cp, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td class="mono">${cp.control_id}</td>
        <td>${cp.authority}</td>
        <td>${cp.title}</td>
        <td>${cp.category}</td>
        <td><span class="severity-badge" style="background: ${
          severityColors[cp.severity_level] ?? '#64748b'
        }20; color: ${severityColors[cp.severity_level] ?? '#64748b'};">${
          cp.severity_level
        }</span></td>
        <td class="num">${formatSAR(Number(cp.fine_estimate_sar))}</td>
        <td>${cp.status === 'open' ? 'مفتوح' : cp.status === 'in_progress' ? 'قيد المعالجة' : 'تم الحل'}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>TUVERIX — تقرير تدقيق الامتثال</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 20mm 16mm;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    font-family: 'Cairo', 'Segoe UI', 'Tahoma', sans-serif;
    color: #1e293b;
    background: #fff;
    line-height: 1.6;
    font-size: 13px;
  }
  .report { max-width: 100%; margin: 0 auto; }

  /* Cover header */
  .cover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 3px solid #15803d;
    margin-bottom: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-logo {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: #15803d;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
  }
  .brand-name {
    font-size: 22px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
  }
  .brand-sub {
    font-size: 11px;
    color: #64748b;
  }
  .report-meta {
    text-align: left;
  }
  .report-meta .label {
    font-size: 10px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .report-meta .value {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }
  .report-meta .doc-id {
    font-family: monospace;
    font-size: 12px;
    color: #15803d;
    font-weight: 600;
  }

  /* Title section */
  .title-section {
    text-align: center;
    padding: 20px 0 24px;
  }
  .title-section h1 {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 6px;
  }
  .title-section .subtitle {
    font-size: 14px;
    color: #64748b;
  }

  /* Info grid */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  .info-cell {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 14px;
  }
  .info-cell .lbl {
    font-size: 10px;
    color: #94a3b8;
    margin-bottom: 4px;
  }
  .info-cell .val {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }

  /* KPI cards */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }
  .kpi {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
    text-align: center;
  }
  .kpi .kpi-val {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
  }
  .kpi .kpi-lbl {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
  }
  .kpi.green .kpi-val { color: #16a34a; }
  .kpi.blue .kpi-val { color: #0284c7; }
  .kpi.teal .kpi-val { color: #15803d; }
  .kpi.red .kpi-val { color: #dc2626; }

  /* Section heading */
  .section-heading {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-heading::before {
    content: '';
    width: 4px;
    height: 20px;
    background: #15803d;
    border-radius: 2px;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  thead th {
    background: #f1f5f9;
    padding: 10px 8px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    text-align: right;
    border-bottom: 2px solid #e2e8f0;
    white-space: nowrap;
  }
  tbody td {
    padding: 8px;
    font-size: 12px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }
  tbody tr.odd { background: #fafbfc; }
  .mono { font-family: monospace; font-size: 11px; color: #64748b; }
  .num { font-weight: 600; text-align: left; white-space: nowrap; }
  .severity-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
  }

  /* Summary footer */
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 14px 16px;
    background: #f8fafc;
    border-radius: 8px;
    margin-bottom: 24px;
    border: 1px solid #e2e8f0;
  }
  .summary-row .item .lbl {
    font-size: 11px;
    color: #94a3b8;
  }
  .summary-row .item .val {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
  }

  /* Signatures */
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 40px;
    padding-top: 20px;
  }
  .sig-block {
    text-align: center;
  }
  .sig-line {
    border-top: 1px solid #cbd5e1;
    padding-top: 8px;
    margin-top: 50px;
  }
  .sig-role {
    font-size: 12px;
    font-weight: 600;
    color: #334155;
  }
  .sig-name {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 2px;
  }

  /* Page footer */
  .page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 9px;
    color: #94a3b8;
    padding: 8px;
    border-top: 1px solid #e2e8f0;
    background: #fff;
  }

  .status-text {
    font-size: 11px;
  }

  .note-box {
    background: #fefce8;
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 20px;
    font-size: 11px;
    color: #92400e;
  }

  @media print {
    .no-print { display: none !important; }
  }
  .print-bar {
    position: sticky;
    top: 0;
    background: #15803d;
    color: #fff;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 100;
  }
  .print-bar button {
    background: #fff;
    color: #15803d;
    border: none;
    padding: 8px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }
  .print-bar .close-btn {
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.4);
  }
</style>
</head>
<body>
  <div class="print-bar no-print">
    <span style="font-size: 13px; font-weight: 600;">تقرير تدقيق الامتثال — TUVERIX</span>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()">طباعة / حفظ PDF</button>
      <button class="close-btn" onclick="window.close()">إغلاق</button>
    </div>
  </div>

  <div class="report" style="padding: 20px;">
    <!-- Cover header -->
    <div class="cover-header">
      <div class="brand">
        <div class="brand-logo">T</div>
        <div>
          <div class="brand-name">TUVERIX</div>
          <div class="brand-sub">منصة الامتثال التنظيمي للقطاع الغذائي</div>
        </div>
      </div>
      <div class="report-meta">
        <div class="label">رقم المستند</div>
        <div class="doc-id">TUVERIX-AUD-${Date.now().toString().slice(-8)}</div>
        <div class="label" style="margin-top: 8px;">تاريخ الإصدار</div>
        <div class="value">${reportDate}</div>
      </div>
    </div>

    <!-- Title -->
    <div class="title-section">
      <h1>تقرير تدقيق الامتثال التنظيمي</h1>
      <div class="subtitle">مراجعة شاملة لنقاط الرقابة والامتثال للجهات التنظيمية</div>
    </div>

    <!-- Info grid -->
    <div class="info-grid">
      <div class="info-cell">
        <div class="lbl">القطاع</div>
        <div class="val">الأغذية والمشروبات</div>
      </div>
      <div class="info-cell">
        <div class="lbl">المنطقة</div>
        <div class="val">المملكة العربية السعودية</div>
      </div>
      <div class="info-cell">
        <div class="lbl">حالة النظام</div>
        <div class="val" style="color: #16a34a;">يعمل (Pilot Active)</div>
      </div>
    </div>

    <!-- KPI Summary -->
    <div class="kpi-row">
      <div class="kpi blue">
        <div class="kpi-val">${stats.authorities}</div>
        <div class="kpi-lbl">الجهات التنظيمية</div>
      </div>
      <div class="kpi teal">
        <div class="kpi-val">${stats.controlPoints}</div>
        <div class="kpi-lbl">نقاط الرقابة</div>
      </div>
      <div class="kpi green">
        <div class="kpi-val">${stats.complianceRate}</div>
        <div class="kpi-lbl">معدل الامتثال</div>
      </div>
      <div class="kpi red">
        <div class="kpi-val">${stats.openAlerts}</div>
        <div class="kpi-lbl">تنبيهات مفتوحة</div>
      </div>
    </div>

    <!-- Note -->
    <div class="note-box">
      هذا التقرير يغطي جميع نقاط الرقابة التنظيمية المسجلة في النظام، بما في ذلك مستوى الخطورة وتقدير الغرامات لكل نقطة. يجب مراجعة التقرير من قبل المسؤول عن الامتثال قبل اتخاذ أي إجراء.
    </div>

    <!-- Control Points Table -->
    <div class="section-heading">نقاط الرقابة التنظيمية</div>
    <table>
      <thead>
        <tr>
          <th>المعرّف</th>
          <th>الجهة التنظيمية</th>
          <th>العنوان</th>
          <th>التصنيف</th>
          <th>مستوى الخطورة</th>
          <th>الغرامة المقدّرة</th>
          <th>الحالة</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <!-- Summary -->
    <div class="summary-row">
      <div class="item">
        <div class="lbl">إجمالي نقاط الرقابة</div>
        <div class="val">${controlPoints.length}</div>
      </div>
      <div class="item">
        <div class="lbl">إجمالي الغرامات المقدّرة</div>
        <div class="val">${formatSAR(totalFines)}</div>
      </div>
      <div class="item">
        <div class="lbl">معدل الامتثال</div>
        <div class="val" style="color: #16a34a;">${stats.complianceRate}</div>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line">
          <div class="sig-role">مسؤول الامتثال</div>
          <div class="sig-name">التوقيع والتاريخ</div>
        </div>
      </div>
      <div class="sig-block">
        <div class="sig-line">
          <div class="sig-role">مدير العمليات</div>
          <div class="sig-name">التوقيع والتاريخ</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    TUVERIX — منصة الامتثال التنظيمي للقطاع الغذائي | تقرير ولّد آلياً بتاريخ ${reportDate}
  </div>

  <script>
    // Auto-open print dialog
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
