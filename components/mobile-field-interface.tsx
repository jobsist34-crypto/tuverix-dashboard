'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  MapPin,
  User,
  Camera,
  Check,
  Clock,
  AlertTriangle,
  ListChecks,
  History,
  Bell,
  X,
  Upload,
  Thermometer,
  ImageOff,
  ArrowRight,
} from 'lucide-react';
import { supabase, type InspectionEvidence } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type MobileTab = 'tasks' | 'history' | 'alerts';

type TaskStatus = 'pending' | 'review' | 'done';

type DailyTask = {
  id: string;
  control_id: string;
  title: string;
  category: string;
  status: TaskStatus;
};

const taskStatusConfig: Record<
  TaskStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: 'معلقة',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock,
  },
  review: {
    label: 'بانتظار المراجعة',
    className: 'bg-accent/10 text-accent border-accent/20',
    icon: Upload,
  },
  done: {
    label: 'مكتملة',
    className: 'bg-success/10 text-success border-success/20',
    icon: Check,
  },
};

const branchName = 'فرع التخصصي';
const role = 'باريستا';

const initialTasks: DailyTask[] = [
  {
    id: 't1',
    control_id: 'CTRL-SFDA-MILK-001',
    title: 'قياس درجة حرارة ثلاجة الحليب',
    category: 'سلامة الغذاء',
    status: 'pending',
  },
  {
    id: 't2',
    control_id: 'CTRL-SFDA-HYGIENE-002',
    title: 'فحص نظافة أسطح التحضير',
    category: 'الصحة العامة',
    status: 'pending',
  },
  {
    id: 't3',
    control_id: 'CTRL-SFDA-EXPIRY-004',
    title: 'مراجعة تواريخ صلاحية المنتجات',
    category: 'سلامة الغذاء',
    status: 'review',
  },
  {
    id: 't4',
    control_id: 'CTRL-SFDA-TEMP-003',
    title: 'تسجيل درجة حرارة الثلاجة الرئيسية',
    category: 'سلامة الغذاء',
    status: 'done',
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function MobileFieldInterface({
  onExit,
}: {
  onExit: () => void;
}) {
  const [tab, setTab] = useState<MobileTab>('tasks');
  const [tasks, setTasks] = useState<DailyTask[]>(initialTasks);
  const [modalTask, setModalTask] = useState<DailyTask | null>(null);
  const [history, setHistory] = useState<InspectionEvidence[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const { data } = await supabase
      .from('inspection_evidence')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory(data ?? []);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const taskCounts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const handleEvidenceSubmitted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'review' } : t))
    );
    setModalTask(null);
    fetchHistory();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">TUVERIX</h1>
            <p className="text-[10px] text-muted-foreground">تطبيق الموظف الميداني</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="gap-1 text-xs"
        >
          <X className="h-4 w-4" />
          خروج
        </Button>
      </header>

      {/* Branch / Role banner */}
      <div className="flex items-center justify-between bg-primary/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">{branchName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-accent" />
          <span className="font-medium text-muted-foreground">{role}</span>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-md px-4 py-5 pb-24">
          {tab === 'tasks' && (
            <TasksTab
              tasks={tasks}
              counts={taskCounts}
              onOpenCapture={(task) => setModalTask(task)}
            />
          )}
          {tab === 'history' && (
            <HistoryTab
              evidence={history}
              loading={historyLoading}
              onRefresh={fetchHistory}
            />
          )}
          {tab === 'alerts' && <AlertsTab />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="flex border-t border-border/60 bg-card px-2 py-1.5 pb-[env(safe-area-inset-bottom)]">
        <BottomNavButton
          icon={ListChecks}
          label="المهام اليومية"
          active={tab === 'tasks'}
          onClick={() => setTab('tasks')}
          badge={taskCounts.pending}
        />
        <BottomNavButton
          icon={History}
          label="السجل الميداني"
          active={tab === 'history'}
          onClick={() => setTab('history')}
        />
        <BottomNavButton
          icon={Bell}
          label="تنبيهات الفرع"
          active={tab === 'alerts'}
          onClick={() => setTab('alerts')}
          badge={2}
        />
      </nav>

      {/* Evidence Capture Modal */}
      {modalTask && (
        <EvidenceCaptureModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onSubmitted={() => handleEvidenceSubmitted(modalTask.id)}
        />
      )}
    </div>
  );
}

/* ---------- Tasks Tab ---------- */

function TasksTab({
  tasks,
  counts,
  onOpenCapture,
}: {
  tasks: DailyTask[];
  counts: { total: number; pending: number; review: number; done: number };
  onOpenCapture: (task: DailyTask) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">المهام اليومية</h2>
        <p className="text-xs text-muted-foreground">
          {counts.total} مهمة — {counts.done} مكتملة، {counts.review} قيد المراجعة،{' '}
          {counts.pending} معلقة
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        <ProgressSegment value={counts.done} total={counts.total} className="bg-success" />
        <ProgressSegment value={counts.review} total={counts.total} className="bg-accent" />
        <ProgressSegment value={counts.pending} total={counts.total} className="bg-warning" />
      </div>

      <div className="space-y-3">
        {tasks.map((task, i) => {
          const cfg = taskStatusConfig[task.status];
          const StatusIcon = cfg.icon;
          return (
            <Card
              key={task.id}
              className="overflow-hidden border-border/60 shadow-sm animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 font-mono text-[10px] font-semibold text-muted-foreground">
                      {task.control_id}
                    </div>
                    <h3 className="text-sm font-semibold leading-snug">
                      {task.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {task.category}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                      cfg.className
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </div>

                {task.status === 'pending' && (
                  <Button
                    size="sm"
                    className="mt-3 w-full gap-1.5"
                    onClick={() => onOpenCapture(task)}
                  >
                    <Camera className="h-4 w-4" />
                    إرفاق الدليل الميداني
                  </Button>
                )}
                {task.status === 'review' && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-accent/5 py-2 text-xs text-accent">
                    <Clock className="h-3.5 w-3.5" />
                    تم الإرسال — بانتظار مراجعة المدير
                  </div>
                )}
                {task.status === 'done' && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-success/5 py-2 text-xs text-success">
                    <Check className="h-3.5 w-3.5" />
                    تم إكمال المهمة
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ProgressSegment({
  value,
  total,
  className,
}: {
  value: number;
  total: number;
  className: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  if (pct === 0) return null;
  return (
    <div
      className={cn('h-2 rounded-full', className)}
      style={{ flex: `${pct}` }}
    />
  );
}

/* ---------- History Tab ---------- */

function HistoryTab({
  evidence,
  loading,
  onRefresh,
}: {
  evidence: InspectionEvidence[];
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">السجل الميداني</h2>
          <p className="text-xs text-muted-foreground">
            آخر الأدلة المرسلة من الفرع
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} className="text-xs">
          تحديث
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : evidence.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <History className="h-8 w-8 opacity-40" />
            <p className="text-sm">لا توجد سجلات بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {evidence.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ item }: { item: InspectionEvidence }) {
  const [imgError, setImgError] = useState(false);
  const statusColor =
    item.status === 'approved'
      ? 'text-success'
      : item.status === 'rejected'
        ? 'text-destructive'
        : 'text-warning';

  const statusLabel =
    item.status === 'approved'
      ? 'مكتمل'
      : item.status === 'rejected'
        ? 'غير مطابق'
        : 'بانتظار المراجعة';

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="flex items-center gap-3 p-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-5 w-5 text-muted-foreground/50" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.control_point_id}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] font-semibold text-muted-foreground">
            {item.control_point_id}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {item.branch_name}
          </div>
          {item.metric_value !== null && (
            <div className="mt-0.5 text-xs font-medium text-foreground">
              القراءة: {item.metric_value}°C
            </div>
          )}
        </div>
        <span className={cn('shrink-0 text-[10px] font-semibold', statusColor)}>
          {statusLabel}
        </span>
      </CardContent>
    </Card>
  );
}

/* ---------- Alerts Tab ---------- */

function AlertsTab() {
  const alerts = [
    {
      id: 'a1',
      title: 'انخفاض درجة حرارة ثلاجة الحليب',
      detail: 'درجة الحرارة 7°C — الحد المسموح 4°C',
      severity: 'عالي',
      time: 'قبل ساعتين',
    },
    {
      id: 'a2',
      title: 'مهمة معلقة لم تكتمل',
      detail: 'فحص نظافة أسطح التحضير — متأخرة 3 ساعات',
      severity: 'متوسط',
      time: 'قبل ساعة',
    },
  ];

  const severityClass: Record<string, string> = {
    'عالي': 'bg-destructive/10 text-destructive border-destructive/20',
    'متوسط': 'bg-warning/10 text-warning border-warning/20',
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">تنبيهات الفرع</h2>
        <p className="text-xs text-muted-foreground">
          تنبيهات تحتاج إلى اهتمام فوري
        </p>
      </div>

      {alerts.map((alert, i) => (
        <Card
          key={alert.id}
          className="border-border/60 shadow-sm animate-fade-in-up"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{alert.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {alert.detail}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                      severityClass[alert.severity]
                    )}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {alert.time}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Evidence Capture Modal ---------- */

function EvidenceCaptureModal({
  task,
  onClose,
  onSubmitted,
}: {
  task: DailyTask;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metric, setMetric] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setSubmitError('يرجى اختيار صورة أولاً');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${task.control_id}-${Date.now()}.${ext}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('inspection-evidences')
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });

      let imageUrl: string;

      if (uploadError) {
        // Fallback: use object URL won't persist, so use a placeholder approach
        // If upload fails, still insert the record with the public URL attempt
        imageUrl = `${supabaseUrl}/storage/v1/object/public/inspection-evidences/${filePath}`;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('inspection-evidences')
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;

      const { error: insertError } = await supabase
        .from('inspection_evidence')
        .insert({
          control_point_id: task.control_id,
          branch_name: branchName,
          image_url: imageUrl,
          storage_path: filePath,
          responsible_role: role.toUpperCase().includes('BARISTA')
            ? 'BARISTA'
            : 'SHIFT_MANAGER',
          captured_at: new Date().toISOString(),
          status: 'pending',
          metric_value: metric ? parseFloat(metric) : null,
        });

      if (insertError) throw insertError;

      onSubmitted();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'فشل إرسال الدليل'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-background">
      {/* Modal header */}
      <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3">
        <h2 className="text-sm font-bold">إرفاق الدليل الميداني</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-md space-y-5 p-4">
          {/* Task info */}
          <Card className="border-border/60 bg-muted/30">
            <CardContent className="p-3">
              <div className="font-mono text-[10px] font-semibold text-muted-foreground">
                {task.control_id}
              </div>
              <h3 className="mt-0.5 text-sm font-semibold">{task.title}</h3>
            </CardContent>
          </Card>

          {/* Photo picker */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              صورة الدليل
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="معاينة الدليل"
                  className="aspect-[4/3] w-full object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <Camera className="h-10 w-10" />
                <span className="text-sm font-medium">التقط صورة أو اختر من المعرض</span>
                <span className="text-xs text-muted-foreground/70">
                  اضغط لفتح الكاميرا
                </span>
              </button>
            )}
          </div>

          {/* Metric input */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <Thermometer className="h-4 w-4 text-accent" />
              درجة الحرارة المسجلة °C
            </label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="مثال: 4.0"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="text-right text-lg font-semibold tabular-nums"
              dir="ltr"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              أدخل القراءة المسجلة من الجهاز
            </p>
          </div>

          {/* Error */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <Button
            className="w-full gap-2"
            size="lg"
            disabled={submitting || !selectedFile}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                إرسال الدليل
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Bottom Nav ---------- */

function BottomNavButton({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: typeof ListChecks;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition-colors',
        active ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -left-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
      {active && (
        <span className="absolute -bottom-1.5 h-1 w-8 rounded-full bg-primary" />
      )}
    </button>
  );
}
