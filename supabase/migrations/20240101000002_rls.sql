-- Supabase Migration 002: Row Level Security
-- Public can read published content only. Staff access is checked against profiles.role.
-- The API service_role bypasses RLS; browser clients go through these policies.

-- Helper: is the current user staff?
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('SUPER_ADMIN','CEO','OPERATIONS_MANAGER','PROJECT_MANAGER','SALES','FINANCE','HR','CUSTOMER_SUPPORT','ADMIN','DEVELOPER','DESIGNER')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_finance()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN','CEO','FINANCE','ADMIN')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_hr()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN','CEO','HR','ADMIN')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS everywhere
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES: read own + staff read all; update own
DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id OR public.is_staff());
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- PUBLIC CONTENT: categories, services, published projects/posts
DROP POLICY IF EXISTS categories_public ON categories;
CREATE POLICY categories_public ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS categories_staff_write ON categories;
CREATE POLICY categories_staff_write ON categories FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS services_public ON services;
CREATE POLICY services_public ON services FOR SELECT USING (true);
DROP POLICY IF EXISTS services_staff_write ON services;
CREATE POLICY services_staff_write ON services FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS projects_public ON projects;
CREATE POLICY projects_public ON projects FOR SELECT USING (status IN ('LIVE','COMPLETED','IN_PROGRESS'));
DROP POLICY IF EXISTS projects_staff_write ON projects;
CREATE POLICY projects_staff_write ON projects FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS posts_public ON posts;
CREATE POLICY posts_public ON posts FOR SELECT USING (status = 'PUBLISHED');
DROP POLICY IF EXISTS posts_staff_write ON posts;
CREATE POLICY posts_staff_write ON posts FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- LEADS: public can submit (insert), staff read/write
DROP POLICY IF EXISTS leads_public_insert ON leads;
CREATE POLICY leads_public_insert ON leads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS leads_staff ON leads;
CREATE POLICY leads_staff ON leads FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS lead_notes_staff ON lead_notes;
CREATE POLICY lead_notes_staff ON lead_notes FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- PROJECT DELIVERY: staff only (clients get access via service_role API scoping in v1; tighten later per-project)
DROP POLICY IF EXISTS pm_staff ON project_members;
CREATE POLICY pm_staff ON project_members FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS milestones_staff ON milestones;
CREATE POLICY milestones_staff ON milestones FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS tasks_staff ON tasks;
CREATE POLICY tasks_staff ON tasks FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS task_comments_staff ON task_comments;
CREATE POLICY task_comments_staff ON task_comments FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- FINANCE: finance roles only
DROP POLICY IF EXISTS invoices_finance ON invoices;
CREATE POLICY invoices_finance ON invoices FOR ALL USING (public.is_finance()) WITH CHECK (public.is_finance());
DROP POLICY IF EXISTS invoice_items_finance ON invoice_items;
CREATE POLICY invoice_items_finance ON invoice_items FOR ALL USING (public.is_finance()) WITH CHECK (public.is_finance());
DROP POLICY IF EXISTS payments_finance ON payments;
CREATE POLICY payments_finance ON payments FOR ALL USING (public.is_finance()) WITH CHECK (public.is_finance());
DROP POLICY IF EXISTS expenses_staff ON expenses;
CREATE POLICY expenses_staff ON expenses FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- QUOTES: public insert (quote builder), staff manage
DROP POLICY IF EXISTS quotes_public_insert ON quotes;
CREATE POLICY quotes_public_insert ON quotes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS quotes_staff ON quotes;
CREATE POLICY quotes_staff ON quotes FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS quote_items_staff ON quote_items;
CREATE POLICY quote_items_staff ON quote_items FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ANALYTICS: anyone can insert page views; staff read
DROP POLICY IF EXISTS analytics_insert ON analytics_events;
CREATE POLICY analytics_insert ON analytics_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS analytics_staff_read ON analytics_events;
CREATE POLICY analytics_staff_read ON analytics_events FOR SELECT USING (public.is_staff());

-- HR: hr roles
DROP POLICY IF EXISTS departments_staff_read ON departments;
CREATE POLICY departments_staff_read ON departments FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS departments_admin_write ON departments;
CREATE POLICY departments_admin_write ON departments FOR ALL USING (public.is_hr()) WITH CHECK (public.is_hr());
DROP POLICY IF EXISTS employees_hr ON employees;
CREATE POLICY employees_hr ON employees FOR ALL USING (public.is_hr()) WITH CHECK (public.is_hr());

-- SYSTEM: roles/permissions read for staff, audit append-only for staff, settings staff read + admin write
DROP POLICY IF EXISTS roles_staff ON roles;
CREATE POLICY roles_staff ON roles FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS permissions_staff ON permissions;
CREATE POLICY permissions_staff ON permissions FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS role_permissions_staff ON role_permissions;
CREATE POLICY role_permissions_staff ON role_permissions FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS audit_staff_read ON audit_logs;
CREATE POLICY audit_staff_read ON audit_logs FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS audit_staff_insert ON audit_logs;
CREATE POLICY audit_staff_insert ON audit_logs FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS settings_staff_read ON settings;
CREATE POLICY settings_staff_read ON settings FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS settings_admin_write ON settings;
CREATE POLICY settings_admin_write ON settings FOR ALL USING (public.is_hr()) WITH CHECK (public.is_hr());

-- STORAGE buckets (private by default; blog public)
INSERT INTO storage.buckets (id, name, public) VALUES
  ('project-assets','project-assets', false),
  ('avatars','avatars', false),
  ('blog','blog', true),
  ('invoices','invoices', false),
  ('documents','documents', false)
ON CONFLICT (id) DO NOTHING;
