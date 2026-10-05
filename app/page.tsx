'use client';

import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Building2, TriangleAlert as AlertTriangle, Gauge, Search, TrendingUp, TrendingDown, CircleDot, Bell, Settings, ChevronLeft, ChartBar as FileBarChart, Users, LayoutDashboard, ClipboardCheck, Camera, Smartphone, Monitor, FileDown, Cpu, Zap } from 'lucide-react';
import { supabase, isMockMode, mockControlPoints, type ControlPoint } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EvidenceFeed } from '@/components/evidence-feed';
import { MobileFieldInterface } from '@/components/mobile-field-interface';
import { AIAlertModal, type AIAlert } from '@/components/ai-alert-modal';
import { AlertsView } from '@/components/alerts-view';
import { generateAuditReport } from '@/lib/report';
import { toast } from 'sonner';

type ViewKey = 'dashboard' | 'evidence' | 'alerts';
type AppMode = 'desktop' | 'mobile';

const severityStyles: Record<string, string> = {
  'حرج': 'bg-destructive/10 text-destructive border-destructive/20',
  'عالي': 'bg-warning/10 text-warning border-warning/20',
  'متوسط': 'bg-accent/10 text-accent border-accent/20',
  'منخفض': 'bg-success/10 text-success border-success/20',
};

const aiSnapshotUrl =
  'https://images.pexels.com/photos/12203611/pexels-photo-12203611.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

function formatSAR(value: number) {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(value);
}

type StatCard = {
  id: string;
  label: string;
  value: string;
  icon: typeof Building2;
  trend?: { value: string; up: boolean };
  accent: string;
};

export default function DashboardPage() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [appMode, setAppMode] = useState<AppMode>('desktop');
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [aiAlerts, setAIAlerts] = useState<AIAlert[]>([]);
  const [modalAlert, setModalAlert] = useState<AIAlert | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (isMockMode) {
      setControlPoints(mockControlPoints);
      setLoading(false);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from('control_points')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setControlPoints(data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const triggerAIAlert = useCallback(() => {
    setSimulating(true);

    setTimeout(() => {
      const newAlert: AIAlert = {
        id: `ai-${Date.now()}`,
        title: 'تنبيه حرج: رصد عدم الالتزام بالزي الموحد (غطاء الرأس)',
        source: 'كاميرا منطقة التحضير (CAM-02) - فرع التخصصي',
        metric: 'دقة الرصد: 94.8% (NVIDIA Edge AI)',
        timestamp: 'الآن',
        snapshotUrl: aiSnapshotUrl,
        severity: 'حرج',
        status: 'new',
      };

      setAIAlerts((prev) => [newAlert, ...prev]);
      setModalAlert(newAlert);
      setSimulating(false);

      toast.error('تنبيه حرج: رصد عدم الالتزام بالزي الموحد (غطاء الرأس)', {
        description: 'كاميرا منطقة التحضير (CAM-02) — دقة الرصد: 94.8%',
        duration: 8000,
        action: {
          label: 'معاينة اللقطة',
          onClick: () => setModalAlert(newAlert),
        },
      });
    }, 1200);
  }, []);

  const handleAlertAction = useCallback(
    (id: string, action: 'sent' | 'resolved') => {
      setAIAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: action } : a))
      );
      if (modalAlert?.id === id) {
        setModalAlert((prev) =>
          prev ? { ...prev, status: action } : null
        );
      }
    },
    [modalAlert]
  );

  const filtered = controlPoints.filter((cp) => {
    const q = search.trim();
    if (!q) return true;
    return (
      cp.control_id.includes(q) ||
      cp.authority.includes(q) ||
      cp.title.includes(q) ||
      cp.category.includes(q)
    );
  });

  const authorities = new Set(controlPoints.map((cp) => cp.authority)).size;
  const openAlerts = controlPoints.filter((cp) => cp.status === 'open').length;
  const newAIAlertCount = aiAlerts.filter(
    (a) => a.status === 'new'
  ).length;
  const totalAlertBadge = openAlerts + newAIAlertCount;

  const stats: StatCard[] = [
    {
      id: 'authorities',
      label: 'الجهات التنظيمية',
      value: String(authorities),
      icon: Building2,
      trend: { value: '+2 هذا الربع', up: true },
      accent: 'text-accent bg-accent/10',
    },
    {
      id: 'control-points',
      label: 'نقاط الرقابة',
      value: String(controlPoints.length),
      icon: CircleDot,
      trend: { value: '+8 هذا الشهر', up: true },
      accent: 'text-primary bg-primary/10',
    },
    {
      id: 'compliance',
      label: 'معدل الامتثال',
      value: '94.5%',
      icon: Gauge,
      trend: { value: '+1.2% عن الشهر الماضي', up: true },
      accent: 'text-success bg-success/10',
    },
    {
      id: 'alerts',
      label: 'التنبيهات المفتوحة',
      value: String(totalAlertBadge),
      icon: AlertTriangle,
      trend: { value: '-3 منذ الأسبوع الماضي', up: false },
      accent: 'text-destructive bg-destructive/10',
    },
  ];

  const navItems: { key: ViewKey; icon: typeof LayoutDashboard; label: string; badge?: number }[] = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { key: 'evidence', icon: Camera, label: 'سجل الأدلة والتفتيش' },
    { key: 'alerts', icon: AlertTriangle, label: 'التنبيهات', badge: totalAlertBadge },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">
                TUVERIX
              </h1>
              <p className="text-[11px] text-muted-foreground">
                منصة الامتثال التنظيمي للقطاع الغذائي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              <span className="text-xs font-semibold text-success">
                النظام يعمل
              </span>
              <span className="hidden text-xs text-success/70 sm:inline">
                (Pilot Active)
              </span>
            </div>

            {/* AI Alert Simulator Button */}
            <Button
              variant="default"
              size="sm"
              className={cn(
                'gap-1.5 rounded-lg border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground',
                newAIAlertCount > 0 && 'animate-pulse'
              )}
              onClick={triggerAIAlert}
              disabled={simulating}
            >
              {simulating ? (
                <>
                  <Cpu className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">جاري التحليل...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">محاكاة تنبيه الذكاء الاصطناعي</span>
                  <span className="sm:hidden">محاكاة AI</span>
                </>
              )}
            </Button>

            <Button
              variant={appMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() =>
                setAppMode((prev) => (prev === 'mobile' ? 'desktop' : 'mobile'))
              }
            >
              {appMode === 'mobile' ? (
                <>
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">عرض المكتب</span>
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden sm:inline">العرض الميداني</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() =>
                generateAuditReport(controlPoints, {
                  authorities,
                  controlPoints: controlPoints.length,
                  complianceRate: '94.5%',
                  openAlerts,
                })
              }
              disabled={loading || !!error || controlPoints.length === 0}
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden md:inline">تصدير PDF</span>
            </Button>

            <Button variant="ghost" size="icon" className="rounded-lg relative">
              <Bell className="h-5 w-5" />
              {newAIAlertCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                  {newAIAlertCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
              TVX
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                active={view === item.key}
                badge={item.badge}
                onClick={() => setView(item.key)}
              />
            ))}
            <div className="my-2 border-t border-border/40" />
            <NavItem icon={Building2} label="الجهات التنظيمية" />
            <NavItem icon={ClipboardCheck} label="نقاط الرقابة" />
            <NavItem icon={FileBarChart} label="التقارير" />
            <NavItem icon={Users} label="المستخدمون" />

            {/* AI status card */}
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-primary">
                    Edge AI Active
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    NVIDIA Jetson — CAM-02
                  </p>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 space-y-6">
          {view === 'alerts' ? (
            <AlertsView
              aiAlerts={aiAlerts}
              onViewSnapshot={(alert) => setModalAlert(alert)}
            />
          ) : view === 'evidence' ? (
            <>
              <div className="flex flex-col gap-1 animate-fade-in-up">
                <h2 className="text-2xl font-bold tracking-tight">
                  سجل الأدلة والتفتيش
                </h2>
                <p className="text-sm text-muted-foreground">
                  مراجعة صور الأدلة والتفتيش من الفروع واعتمادها أو تسجيل المخالفات
                </p>
              </div>
              <EvidenceFeed />
            </>
          ) : (
            <>
              {/* Page title */}
              <div className="flex flex-col gap-1 animate-fade-in-up">
                <h2 className="text-2xl font-bold tracking-tight">
                  نظرة عامة على الامتثال
                </h2>
                <p className="text-sm text-muted-foreground">
                  مراقبة في الوقت الفعلي لنقاط الرقابة والامتثال التنظيمي
                </p>
              </div>

              {/* Stats KPI Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, i) => (
                  <Card
                    key={stat.id}
                    className="overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-xl',
                            stat.accent
                          )}
                        >
                          <stat.icon className="h-5 w-5" />
                        </div>
                        {stat.trend && (
                          <span
                            className={cn(
                              'flex items-center gap-1 text-xs font-medium',
                              stat.trend.up ? 'text-success' : 'text-destructive'
                            )}
                          >
                            {stat.trend.up ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold tracking-tight">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stat.label}
                        </p>
                        {stat.trend && (
                          <p
                            className={cn(
                              'mt-2 text-xs',
                              stat.trend.up ? 'text-success/80' : 'text-destructive/80'
                            )}
                          >
                            {stat.trend.value}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Data Table */}
              <Card className="border-border/60 shadow-sm animate-fade-in-up">
                <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold">نقاط الرقابة التنظيمية</h3>
                    <p className="text-xs text-muted-foreground">
                      إجمالي {controlPoints.length} نقطة رقابة مسجلة في النظام
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="بحث..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-9 text-right"
                    />
                  </div>
                </div>

                <div className="scrollbar-thin overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-right font-semibold">المعرّف</TableHead>
                        <TableHead className="text-right font-semibold">الجهة التنظيمية</TableHead>
                        <TableHead className="text-right font-semibold">العنوان</TableHead>
                        <TableHead className="text-right font-semibold">التصنيف</TableHead>
                        <TableHead className="text-right font-semibold">مستوى الخطورة</TableHead>
                        <TableHead className="text-right font-semibold">الغرامة المقدّرة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 6 }).map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-5 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center">
                            <div className="flex flex-col items-center gap-2 text-destructive">
                              <AlertTriangle className="h-8 w-8" />
                              <p className="text-sm font-medium">
                                تعذّر تحميل البيانات
                              </p>
                              <p className="text-xs text-muted-foreground">{error}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                            لا توجد نتائج مطابقة
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((cp) => (
                          <TableRow
                            key={cp.id}
                            className="group transition-colors"
                          >
                            <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                              {cp.control_id}
                            </TableCell>
                            <TableCell className="font-medium">{cp.authority}</TableCell>
                            <TableCell className="max-w-xs truncate text-sm">
                              {cp.title}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {cp.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                                  severityStyles[cp.severity_level] ?? 'bg-muted text-muted-foreground border-border'
                                )}
                              >
                                {cp.severity_level}
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm font-semibold tabular-nums">
                              {formatSAR(Number(cp.fine_estimate_sar))}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {!loading && !error && filtered.length > 0 && (
                  <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
                    <p className="text-xs text-muted-foreground">
                      عرض {filtered.length} من {controlPoints.length} سجل
                    </p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" disabled className="gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        السابق
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        التالي
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}
        </main>
      </div>

      {appMode === 'mobile' && (
        <MobileFieldInterface onExit={() => setAppMode('desktop')} />
      )}

      {modalAlert && (
        <AIAlertModal
          alert={modalAlert}
          onClose={() => setModalAlert(null)}
          onAction={handleAlertAction}
        />
      )}
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1 text-right">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}
