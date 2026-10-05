'use client';

import { TriangleAlert as AlertTriangle, Cpu, Camera, Clock, Send, CircleCheck as CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AIAlert } from '@/components/ai-alert-modal';

const severityConfig: Record<string, { className: string; label: string }> = {
  'حرج': {
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    label: 'حرج',
  },
  'عالي': {
    className: 'bg-warning/10 text-warning border-warning/20',
    label: 'عالي',
  },
  'متوسط': {
    className: 'bg-accent/10 text-accent border-accent/20',
    label: 'متوسط',
  },
};

const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  new: {
    label: 'جديد',
    className: 'text-destructive',
    icon: AlertTriangle,
  },
  sent: {
    label: 'تم إرسال الإنذار',
    className: 'text-warning',
    icon: Send,
  },
  resolved: {
    label: 'تم الحل',
    className: 'text-success',
    icon: CheckCircle2,
  },
};

export function AlertsView({
  aiAlerts,
  onViewSnapshot,
}: {
  aiAlerts: AIAlert[];
  onViewSnapshot: (alert: AIAlert) => void;
}) {
  const staticAlerts = [
    {
      id: 'static-1',
      title: 'انخفاض درجة حرارة ثلاجة الحليب',
      detail: 'درجة الحرارة 7°C — الحد المسموح 4°C',
      source: 'حساس IoT — ثلاجة الحليب',
      severity: 'عالي',
      timestamp: 'قبل ساعتين',
    },
    {
      id: 'static-2',
      title: 'مهمة معلقة لم تكتمل',
      detail: 'فحص نظافة أسطح التحضير — متأخرة 3 ساعات',
      source: 'نظام المهام اليومية',
      severity: 'متوسط',
      timestamp: 'قبل ساعة',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight">التنبيهات</h2>
        <p className="text-sm text-muted-foreground">
          التنبيهات الحرجة والتحذيرات من جميع الفروع والمصادر
        </p>
      </div>

      {/* AI Alerts section */}
      {aiAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold">تنبيهات الذكاء الاصطناعي الحافّي</h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
              {aiAlerts.length}
            </span>
          </div>

          <div className="space-y-3">
            {aiAlerts.map((alert, i) => {
              const sev = severityConfig[alert.severity] ?? severityConfig['حرج'];
              const stat = statusConfig[alert.status] ?? statusConfig['new'];
              const StatusIcon = stat.icon;

              return (
                <Card
                  key={alert.id}
                  className={cn(
                    'overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md animate-fade-in-up',
                    alert.status === 'new' && 'border-destructive/30'
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold leading-snug text-foreground">
                            {alert.title}
                          </h4>
                          <span
                            className={cn(
                              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                              sev.className
                            )}
                          >
                            {sev.label}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Camera className="h-3.5 w-3.5 shrink-0 text-accent" />
                            <span>{alert.source}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Cpu className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span>{alert.metric}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className={cn(
                              'flex items-center gap-1.5 text-[11px] font-semibold',
                              stat.className
                            )}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {stat.label}
                          </span>
                        </div>

                        {alert.status !== 'resolved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 gap-1.5 text-xs"
                            onClick={() => onViewSnapshot(alert)}
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            معاينة لقطة الكاميرا
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Separator */}
      <div className="border-t border-border/40" />

      {/* General alerts */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold">تنبيهات الفروع والأنظمة</h3>

        {aiAlerts.length === 0 && staticAlerts.length > 0 && (
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  محاكاة تنبيه الذكاء الاصطناعي
                </p>
                <p className="text-xs text-muted-foreground">
                  اضغط زر &ldquo;محاكاة تنبيه الذكاء الاصطناعي&rdquo; في الشريط العلوي لتجربة الرصد الآلي
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {staticAlerts.map((alert, i) => {
          const sev = severityConfig[alert.severity] ?? severityConfig['متوسط'];
          return (
            <Card
              key={alert.id}
              className="border-border/60 shadow-sm animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      alert.severity === 'عالي'
                        ? 'bg-warning/10'
                        : 'bg-accent/10'
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        'h-5 w-5',
                        alert.severity === 'عالي'
                          ? 'text-warning'
                          : 'text-accent'
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold">{alert.title}</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {alert.detail}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                          sev.className
                        )}
                      >
                        {sev.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {alert.timestamp}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        · {alert.source}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
