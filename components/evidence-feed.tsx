'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Check,
  X,
  Clock,
  MapPin,
  Tag,
  User,
  Camera,
  AlertTriangle,
  FileCheck,
  ImageOff,
} from 'lucide-react';
import { supabase, type InspectionEvidence, type EvidenceStatus } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const statusConfig: Record<
  EvidenceStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  approved: {
    label: 'مكتمل',
    className: 'bg-success/10 text-success border-success/20',
    icon: FileCheck,
  },
  pending: {
    label: 'بانتظار المراجعة',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock,
  },
  rejected: {
    label: 'غير مطابق',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: AlertTriangle,
  },
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function EvidenceFeed() {
  const [evidence, setEvidence] = useState<InspectionEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inspection_evidence')
      .select('*')
      .order('captured_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setEvidence(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const updateStatus = async (id: string, status: EvidenceStatus) => {
    setUpdating((prev) => new Set(prev).add(id));
    const reviewer = 'مدير العمليات';
    const { error } = await supabase
      .from('inspection_evidence')
      .update({
        status,
        reviewed_by: reviewer,
        reviewed_at: new Date().toISOString(),
        manager_note:
          status === 'approved'
            ? 'تم اعتماد الدليل'
            : 'تم رفض الدليل وتسجيل مخالفة',
      })
      .eq('id', id);

    if (!error) {
      setEvidence((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status,
                reviewed_by: reviewer,
                reviewed_at: new Date().toISOString(),
                manager_note:
                  status === 'approved'
                    ? 'تم اعتماد الدليل'
                    : 'تم رفض الدليل وتسجيل مخالفة',
              }
            : e
        )
      );
    }
    setUpdating((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const filtered = evidence.filter((e) => {
    const q = search.trim();
    if (!q) return true;
    return (
      e.control_point_id.toLowerCase().includes(q.toLowerCase()) ||
      e.branch_name.includes(q) ||
      e.responsible_role.toLowerCase().includes(q.toLowerCase())
    );
  });

  const counts = {
    total: evidence.length,
    approved: evidence.filter((e) => e.status === 'approved').length,
    pending: evidence.filter((e) => e.status === 'pending').length,
    rejected: evidence.filter((e) => e.status === 'rejected').length,
  };

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryPill label="إجمالي الأدلة" value={counts.total} className="bg-muted/50 text-foreground" />
        <SummaryPill label="مكتمل" value={counts.approved} className="bg-success/10 text-success" />
        <SummaryPill label="بانتظار المراجعة" value={counts.pending} className="bg-warning/10 text-warning" />
        <SummaryPill label="غير مطابق" value={counts.rejected} className="bg-destructive/10 text-destructive" />
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث بالمعرّف، الفرع، أو الدور..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9 text-right"
        />
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-sm font-medium">تعذّر تحميل الأدلة</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton grid */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/60">
              <Skeleton className="h-44 w-full rounded-none" />
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Camera className="h-10 w-10 opacity-40" />
            <p className="text-sm">لا توجد أدلة مطابقة</p>
          </CardContent>
        </Card>
      )}

      {/* Evidence grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, i) => {
            const cfg = statusConfig[item.status];
            const StatusIcon = cfg.icon;
            const isPending = item.status === 'pending';
            const isUpdating = updating.has(item.id);
            const imgFailed = imgErrors.has(item.id);

            return (
              <Card
                key={item.id}
                className="group flex flex-col overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {imgFailed ? (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ImageOff className="h-8 w-8 opacity-50" />
                        <span className="text-xs">تعذّر تحميل الصورة</span>
                      </div>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={`دليل ${item.control_point_id}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() =>
                        setImgErrors((prev) => new Set(prev).add(item.id))
                      }
                    />
                  )}
                  {/* Status badge overlay */}
                  <div className="absolute right-3 top-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md',
                        cfg.className
                      )}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-muted-foreground">
                    <Tag className="h-3.5 w-3.5 text-accent" />
                    {item.control_point_id}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <MetaRow icon={MapPin} value={item.branch_name} />
                    <MetaRow icon={User} value={item.responsible_role} />
                    <MetaRow icon={Clock} value={formatDateTime(item.captured_at)} />
                  </div>

                  {item.manager_note && (
                    <div
                      className={cn(
                        'rounded-md px-3 py-2 text-xs',
                        item.status === 'approved' && 'bg-success/5 text-success/80',
                        item.status === 'rejected' && 'bg-destructive/5 text-destructive/80',
                        item.status === 'pending' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {item.manager_note}
                      {item.reviewed_by && (
                        <span className="block mt-0.5 opacity-70">
                          — {item.reviewed_by}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-auto flex gap-2 pt-2">
                    {isPending ? (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 gap-1.5 bg-success text-success-foreground hover:bg-success/90"
                          disabled={isUpdating}
                          onClick={() => updateStatus(item.id, 'approved')}
                        >
                          <Check className="h-4 w-4" />
                          اعتماد الدليل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={isUpdating}
                          onClick={() => updateStatus(item.id, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                          رفض / تسجيل مخالفة
                        </Button>
                      </>
                    ) : (
                      <div className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs text-muted-foreground">
                        {item.status === 'approved' && (
                          <>
                            <Check className="h-3.5 w-3.5 text-success" />
                            تم الاعتماد من {item.reviewed_by ?? 'المدير'}
                          </>
                        )}
                        {item.status === 'rejected' && (
                          <>
                            <X className="h-3.5 w-3.5 text-destructive" />
                            تم الرفض من {item.reviewed_by ?? 'المدير'}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MetaRow({ icon: Icon, value }: { icon: typeof MapPin; value: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
      <span className="truncate text-xs">{value}</span>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={cn('rounded-lg border border-border/50 px-4 py-2.5', className)}>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}
