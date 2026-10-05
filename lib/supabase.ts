import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
