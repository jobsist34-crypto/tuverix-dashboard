import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isMockMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export type ControlPoint = {
  id: string;
  control_id: string;
  authority: string;
  title: string;
  category: string;
  severity_level: string;
  fine_estimate_sar: number;
  status: string;
  created_at: string;
};

export type EvidenceStatus = 'pending' | 'approved' | 'rejected';

export type InspectionEvidence = {
  id: string;
  control_point_id: string;
  branch_name: string;
  image_url: string;
  storage_path: string | null;
  responsible_role: string;
  captured_at: string;
  status: EvidenceStatus;
  manager_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  metric_value: number | null;
  created_at: string;
};

export const mockControlPoints: ControlPoint[] = [
  {
    id: 'mock-cp-1',
    control_id: 'CTRL-SFDA-MILK-001',
    authority: 'هيئة الغذاء والدواء (SFDA)',
    title: 'قياس درجة حرارة ثلاجة الحليب',
    category: 'سلامة الغذاء',
    severity_level: 'حرج',
    fine_estimate_sar: 25000,
    status: 'open',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mock-cp-2',
    control_id: 'CTRL-SFDA-HYGIENE-002',
    authority: 'هيئة الغذاء والدواء (SFDA)',
    title: 'فحص نظافة أسطح التحضير',
    category: 'الصحة العامة',
    severity_level: 'عالي',
    fine_estimate_sar: 15000,
    status: 'in_progress',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'mock-cp-3',
    control_id: 'CTRL-SFDA-TEMP-003',
    authority: 'هيئة الغذاء والدواء (SFDA)',
    title: 'تسجيل درجة حرارة الثلاجة الرئيسية',
    category: 'سلامة الغذاء',
    severity_level: 'متوسط',
    fine_estimate_sar: 8000,
    status: 'resolved',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'mock-cp-4',
    control_id: 'CTRL-SFDA-EXPIRY-004',
    authority: 'هيئة الغذاء والدواء (SFDA)',
    title: 'مراجعة تواريخ صلاحية المنتجات',
    category: 'سلامة الغذاء',
    severity_level: 'عالي',
    fine_estimate_sar: 18000,
    status: 'open',
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 'mock-cp-5',
    control_id: 'CTRL-MOI-LICENSE-005',
    authority: 'وزارة الداخلية (MOI)',
    title: 'تجديد رخصة الاستغلال التجاري',
    category: 'التراخيص',
    severity_level: 'منخفض',
    fine_estimate_sar: 5000,
    status: 'resolved',
    created_at: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'mock-cp-6',
    control_id: 'CTRL-MUNICIPAL-WASTE-006',
    authority: 'أمانة الرياض',
    title: 'إدارة النفايات والتخلص الآمن',
    category: 'الصحة العامة',
    severity_level: 'متوسط',
    fine_estimate_sar: 10000,
    status: 'in_progress',
    created_at: new Date(Date.now() - 518400000).toISOString(),
  },
];

const evidenceImageUrls = [
  'https://images.pexels.com/photos/15426303/pexels-photo-15426303.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/14498783/pexels-photo-14498783.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/16864129/pexels-photo-16864129.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export const mockEvidence: InspectionEvidence[] = [
  {
    id: 'mock-ev-1',
    control_point_id: 'CTRL-SFDA-MILK-001',
    branch_name: 'فرع التخصصي',
    image_url: evidenceImageUrls[0],
    storage_path: null,
    responsible_role: 'BARISTA',
    captured_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending',
    manager_note: null,
    reviewed_by: null,
    reviewed_at: null,
    metric_value: 4.2,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mock-ev-2',
    control_point_id: 'CTRL-SFDA-HYGIENE-002',
    branch_name: 'فرع العليا',
    image_url: evidenceImageUrls[1],
    storage_path: null,
    responsible_role: 'SHIFT_MANAGER',
    captured_at: new Date(Date.now() - 7200000).toISOString(),
    status: 'approved',
    manager_note: 'تم اعتماد الدليل',
    reviewed_by: 'مدير العمليات',
    reviewed_at: new Date(Date.now() - 3600000).toISOString(),
    metric_value: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'mock-ev-3',
    control_point_id: 'CTRL-SFDA-TEMP-003',
    branch_name: 'فرع النخيل',
    image_url: evidenceImageUrls[2],
    storage_path: null,
    responsible_role: 'BARISTA',
    captured_at: new Date(Date.now() - 10800000).toISOString(),
    status: 'rejected',
    manager_note: 'تم رفض الدليل وتسجيل مخالفة',
    reviewed_by: 'مدير العمليات',
    reviewed_at: new Date(Date.now() - 9000000).toISOString(),
    metric_value: 7.5,
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'mock-ev-4',
    control_point_id: 'CTRL-SFDA-EXPIRY-004',
    branch_name: 'فرع التخصصي',
    image_url: evidenceImageUrls[0],
    storage_path: null,
    responsible_role: 'SHIFT_MANAGER',
    captured_at: new Date(Date.now() - 14400000).toISOString(),
    status: 'pending',
    manager_note: null,
    reviewed_by: null,
    reviewed_at: null,
    metric_value: null,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
];
