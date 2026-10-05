/*
# Create control_points table for TUVERIX RegTech dashboard

1. New Tables
- `control_points`
  - `id` (uuid, primary key)
  - `control_id` (text, unique human-readable control identifier, e.g. "CP-001")
  - `authority` (text, Saudi regulatory authority name in Arabic, e.g. "هيئة الغذاء والدواء")
  - `title` (text, control point title in Arabic)
  - `category` (text, compliance category in Arabic)
  - `severity_level` (text, one of: 'منخفض', 'متوسط', 'عالي', 'حرج')
  - `fine_estimate_sar` (numeric, estimated fine in SAR)
  - `status` (text, one of: 'open', 'resolved', 'in_progress' — defaults to 'open')
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `control_points`.
- Allow anon + authenticated CRUD (single-tenant public dashboard, no auth).
3. Seed Data
- Insert 12 realistic Saudi F&B regulatory control points.
*/

CREATE TABLE IF NOT EXISTS control_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id text UNIQUE NOT NULL,
  authority text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  severity_level text NOT NULL DEFAULT 'متوسط',
  fine_estimate_sar numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE control_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cp_select" ON control_points;
CREATE POLICY "cp_select" ON control_points FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "cp_insert" ON control_points;
CREATE POLICY "cp_insert" ON control_points FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cp_update" ON control_points;
CREATE POLICY "cp_update" ON control_points FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cp_delete" ON control_points;
CREATE POLICY "cp_delete" ON control_points FOR DELETE
TO anon, authenticated USING (true);

INSERT INTO control_points (control_id, authority, title, category, severity_level, fine_estimate_sar, status) VALUES
('CP-001', 'هيئة الغذاء والدواء', 'التخزين على درجة الحرارة الموصى بها', 'سلامة الغذاء', 'حرج', 50000, 'open'),
('CP-002', 'هيئة الغذاء والدواء', 'صلاحية المنتجات الغذائية', 'سلامة الغذاء', 'عالي', 25000, 'open'),
('CP-003', 'وزارة الصحة', 'الاشتراطات الصحية للمنشأة', 'الصحة العامة', 'عالي', 30000, 'in_progress'),
('CP-004', 'أمانة منطقة الرياض', 'ترخيص المنشأة التجارية', 'التراخيص', 'متوسط', 15000, 'open'),
('CP-005', 'هيئة الغذاء والدواء', 'مطابقة الإضافة الغذائية', 'سلامة الغذاء', 'متوسط', 20000, 'resolved'),
('CP-006', 'هيئة الزكاة والضريبة والجمارك', 'الفوترة الإلكترونية (فاتورة)', 'الامتثال الضريبي', 'عالي', 40000, 'open'),
('CP-007', 'وزارة الموارد البشرية', 'التوطين (نطاقات) في القطاع', 'القوى العاملة', 'متوسط', 18000, 'in_progress'),
('CP-008', 'هيئة الغذاء والدواء', 'نظافة معدات التحضير', 'سلامة الغذاء', 'عالي', 22000, 'open'),
('CP-009', 'أمانة منطقة مكة المكرمة', 'إدارة النفايات الغذائية', 'البيئة والصحة', 'منخفض', 5000, 'open'),
('CP-010', 'هيئة الغذاء والدواء', 'تتبع مصادر المواد الخام', 'سلامة الغذاء', 'حرج', 55000, 'open'),
('CP-011', 'هيئة الزكاة والضريبة والجمارك', 'تطبيق ضريبة القيمة المضافة', 'الامتثال الضريبي', 'عالي', 35000, 'resolved'),
('CP-012', 'وزارة التجارة', 'وضوح الأسعار والإعلانات', 'حماية المستهلك', 'منخفض', 10000, 'open')
ON CONFLICT (control_id) DO NOTHING;
