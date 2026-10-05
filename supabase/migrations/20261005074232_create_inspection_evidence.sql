/*
# Create inspection_evidence table and storage bucket for Evidence Feed

1. New Tables
- `inspection_evidence`
  - `id` (uuid, primary key)
  - `control_point_id` (text, e.g. "CTRL-SFDA-MILK-001")
  - `branch_name` (text, Saudi F&B branch name in Arabic)
  - `image_url` (text, URL to the evidence image — from storage bucket or external)
  - `storage_path` (text, nullable path within the 'inspection-evidences' bucket)
  - `responsible_role` (text, e.g. "BARISTA", "SHIFT_MANAGER")
  - `captured_at` (timestamptz, when the evidence photo was taken)
  - `status` (text, one of: 'pending', 'approved', 'rejected' — defaults to 'pending')
  - `manager_note` (text, nullable note from manager on approve/reject)
  - `reviewed_by` (text, nullable reviewer name)
  - `reviewed_at` (timestamptz, nullable)
  - `created_at` (timestamptz, default now())
2. Storage
- Create public bucket 'inspection-evidences' for evidence photo uploads.
- Add storage policies for public read and anon+authenticated insert.
3. Security
- Enable RLS on `inspection_evidence`.
- Allow anon + authenticated CRUD (single-tenant public dashboard, no auth).
4. Seed Data
- Insert 8 realistic evidence records with Pexels image URLs covering:
  refrigerator temperature, food expiry, surface cleaning, milk steaming, etc.
*/

CREATE TABLE IF NOT EXISTS inspection_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_point_id text NOT NULL,
  branch_name text NOT NULL,
  image_url text NOT NULL,
  storage_path text,
  responsible_role text NOT NULL DEFAULT 'BARISTA',
  captured_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  manager_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inspection_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ie_select" ON inspection_evidence;
CREATE POLICY "ie_select" ON inspection_evidence FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "ie_insert" ON inspection_evidence;
CREATE POLICY "ie_insert" ON inspection_evidence FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "ie_update" ON inspection_evidence;
CREATE POLICY "ie_update" ON inspection_evidence FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ie_delete" ON inspection_evidence;
CREATE POLICY "ie_delete" ON inspection_evidence FOR DELETE
TO anon, authenticated USING (true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-evidences',
  'inspection-evidences',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, anon+auth insert/update
DROP POLICY IF EXISTS "evidence_bucket_read" ON storage.objects;
CREATE POLICY "evidence_bucket_read" ON storage.objects FOR SELECT
TO anon, authenticated USING (bucket_id = 'inspection-evidences');

DROP POLICY IF EXISTS "evidence_bucket_insert" ON storage.objects;
CREATE POLICY "evidence_bucket_insert" ON storage.objects FOR INSERT
TO anon, authenticated WITH CHECK (bucket_id = 'inspection-evidences');

DROP POLICY IF EXISTS "evidence_bucket_update" ON storage.objects;
CREATE POLICY "evidence_bucket_update" ON storage.objects FOR UPDATE
TO anon, authenticated USING (bucket_id = 'inspection-evidences') WITH CHECK (bucket_id = 'inspection-evidences');

DROP POLICY IF EXISTS "evidence_bucket_delete" ON storage.objects;
CREATE POLICY "evidence_bucket_delete" ON storage.objects FOR DELETE
TO anon, authenticated USING (bucket_id = 'inspection-evidences');

-- Seed evidence records
INSERT INTO inspection_evidence (control_point_id, branch_name, image_url, responsible_role, captured_at, status, manager_note, reviewed_by, reviewed_at) VALUES
(
  'CTRL-SFDA-MILK-001',
  'فرع الرياض - حي العليا',
  'https://images.pexels.com/photos/6994196/pexels-photo-6994196.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'BARISTA',
  now() - interval '2 hours',
  'pending',
  NULL,
  NULL,
  NULL
),
(
  'CTRL-SFDA-HYGIENE-002',
  'فرع جدة - حي الروضة',
  'https://images.pexels.com/photos/6205481/pexels-photo-6205481.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'BARISTA',
  now() - interval '5 hours',
  'approved',
  'الصورة مطابقة لاشتراطات النظافة',
  'أ. خالد المنصور',
  now() - interval '3 hours'
),
(
  'CTRL-SFDA-TEMP-003',
  'فرع الدمام - حي الشاطئ',
  'https://images.pexels.com/photos/5953737/pexels-photo-5953737.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'SHIFT_MANAGER',
  now() - interval '8 hours',
  'rejected',
  'درجة الحرارة غير مطابقة — يتطلب إجراء فوري',
  'أ. خالد المنصور',
  now() - interval '6 hours'
),
(
  'CTRL-SFDA-EXPIRY-004',
  'فرع مكة - حي العزيزية',
  'https://images.pexels.com/photos/8093631/pexels-photo-8093631.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'BARISTA',
  now() - interval '12 hours',
  'pending',
  NULL,
  NULL,
  NULL
),
(
  'CTRL-SFDA-CLEAN-005',
  'فرع الرياض - حي الملقا',
  'https://images.pexels.com/photos/13735866/pexels-photo-13735866.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'BARISTA',
  now() - interval '1 day',
  'approved',
  'نظافة المعدات مطابقة للمعايير',
  'أ. نورة العتيبي',
  now() - interval '22 hours'
),
(
  'CTRL-SFDA-KITCHEN-006',
  'فرع الخبر - حي العقربية',
  'https://images.pexels.com/photos/12209739/pexels-photo-12209739.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'SHIFT_MANAGER',
  now() - interval '1 day 4 hours',
  'pending',
  NULL,
  NULL,
  NULL
),
(
  'CTRL-SFDA-SURFACE-007',
  'فرع جدة - حي السلامة',
  'https://images.pexels.com/photos/6205766/pexels-photo-6205766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'BARISTA',
  now() - interval '2 days',
  'approved',
  'الأسطح نظيفة ومطابقة',
  'أ. نورة العتيبي',
  now() - interval '1 day 20 hours'
),
(
  'CTRL-SFDA-STORAGE-008',
  'فرع الرياض - حي النرجس',
  'https://images.pexels.com/photos/5953752/pexels-photo-5953752.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'SHIFT_MANAGER',
  now() - interval '2 days 6 hours',
  'rejected',
  'التخزين غير منظّم — requires reorganization',
  'أ. خالد المنصور',
  now() - interval '2 days'
)
ON CONFLICT DO NOTHING;
