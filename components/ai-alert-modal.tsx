'use client';

import { useState } from 'react';
import { X, Camera, Cpu, Send, CircleCheck as CheckCircle2, Clock, TriangleAlert as AlertTriangle, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type AIAlert = {
  id: string;
  title: string;
  source: string;
  metric: string;
  timestamp: string;
  snapshotUrl: string;
  severity: string;
  status: 'new' | 'sent' | 'resolved';
};

export function AIAlertModal({
  alert,
  onClose,
  onAction,
}: {
  alert: AIAlert;
  onClose: () => void;
  onAction: (id: string, action: 'sent' | 'resolved') => void;
}) {
  const [actionTaken, setActionTaken] = useState<'sent' | 'resolved' | null>(
    null
  );

  const handleSendAlert = () => {
    setActionTaken('sent');
    onAction(alert.id, 'sent');
    toast.success('تم إرسال إنذار فوري إلى الفرع', {
      description: alert.source,
    });
  };

  const handleResolve = () => {
    setActionTaken('resolved');
    onAction(alert.id, 'resolved');
    toast.success('تم اعتماد الإجراء التعويضي', {
      description: 'سيتم تسجيل الإجراء في سجل الامتثال',
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-destructive/30 bg-card shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-destructive/5 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                معاينة لقطة الكاميرا
              </h2>
              <p className="text-[11px] text-muted-foreground">
                رصد آلي بواسطة الذكاء الاصطناعي الحافّي
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* CCTV Snapshot with bounding box */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={alert.snapshotUrl}
            alt="لقطة كاميرا المراقبة"
            className="h-full w-full object-cover opacity-90"
          />

          {/* Scanline overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
            }}
          />

          {/* Red bounding box */}
          <div className="absolute left-[22%] top-[18%] h-[48%] w-[30%]">
            <div className="absolute inset-0 border-2 border-destructive shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              {/* Corner accents */}
              <div className="absolute -left-1 -top-1 h-4 w-4 border-l-4 border-t-4 border-destructive" />
              <div className="absolute -right-1 -top-1 h-4 w-4 border-r-4 border-t-4 border-destructive" />
              <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-4 border-l-4 border-destructive" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-4 border-r-4 border-destructive" />
            </div>
            {/* Detection label */}
            <div className="absolute -top-7 right-0 flex items-center gap-1.5 rounded bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground shadow-lg">
              <Cpu className="h-3 w-3" />
              عدم الالتزام بالزي — 94.8%
            </div>
          </div>

          {/* CCTV metadata overlay */}
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/60 px-2.5 py-1 text-[10px] font-mono text-white backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
              REC
            </span>
            <span className="text-white/70">|</span>
            <span>CAM-02</span>
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-black/60 px-2.5 py-1 text-[10px] font-mono text-white backdrop-blur-sm">
            <Maximize2 className="h-3 w-3" />
            1080p
          </div>
          <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2.5 py-1 text-[10px] font-mono text-white backdrop-blur-sm">
            {alert.timestamp}
          </div>
          <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2.5 py-1 text-[10px] font-mono text-white/80 backdrop-blur-sm">
            منطقة التحضير — فرع التخصصي
          </div>
        </div>

        {/* Alert details */}
        <div className="space-y-3 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-destructive">
              {alert.title}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
              <Camera className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  المصدر
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {alert.source}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
              <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  مقياس الرصد
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {alert.metric}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {actionTaken ? (
            <div
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-semibold',
                actionTaken === 'sent'
                  ? 'bg-warning/10 text-warning'
                  : 'bg-success/10 text-success'
              )}
            >
              {actionTaken === 'sent' ? (
                <>
                  <Send className="h-4 w-4" />
                  تم إرسال الإنذار الفوري إلى الفرع
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  تم اعتماد الإجراء التعويضي بنجاح
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button
                className="flex-1 gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleSendAlert}
              >
                <Send className="h-4 w-4" />
                إرسال إنذار فوري للفرع
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 border-success/30 text-success hover:bg-success/10 hover:text-success"
                onClick={handleResolve}
              >
                <CheckCircle2 className="h-4 w-4" />
                اعتماد الإجراء التعويضي
              </Button>
            </div>
          )}

          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>وقت الرصد: {alert.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
