-- Supabase Seed Data 001: Initial Data
-- Run after migrations

-- Insert initial roles
INSERT INTO roles (name, description) VALUES
  ('SUPER_ADMIN', 'Super administrator with full access'),
  ('CEO', 'Chief Executive Officer'),
  ('OPERATIONS_MANAGER', 'Operations manager'),
  ('PROJECT_MANAGER', 'Project manager'),
  ('DEVELOPER', 'Software developer'),
  ('DESIGNER', 'Designer'),
  ('SALES', 'Sales representative'),
  ('FINANCE', 'Finance team'),
  ('HR', 'Human resources'),
  ('CUSTOMER_SUPPORT', 'Customer support'),
  ('CLIENT', 'Client user')
ON CONFLICT (name) DO NOTHING;

-- Insert initial permissions
INSERT INTO permissions (name, code, description) VALUES
  ('View dashboard', 'dashboard.view', 'Access to dashboard'),
  ('Manage projects', 'projects.manage', 'Create, edit, delete projects'),
  ('View projects', 'projects.view', 'View projects'),
  ('Manage leads', 'leads.manage', 'Create, edit, delete leads'),
  ('View leads', 'leads.view', 'View leads'),
  ('Manage clients', 'clients.manage', 'Manage client profiles'),
  ('View clients', 'clients.view', 'View clients'),
  ('Manage employees', 'employees.manage', 'Manage employee records'),
  ('View employees', 'employees.view', 'View employees'),
  ('Manage departments', 'departments.manage', 'Manage departments'),
  ('View departments', 'departments.view', 'View departments'),
  ('Manage blog', 'blog.manage', 'Create, edit, publish blog posts'),
  ('View blog', 'blog.view', 'View blog posts'),
  ('Manage finance', 'finance.manage', 'Manage invoices, payments'),
  ('View finance', 'finance.view', 'View financial reports'),
  ('Manage analytics', 'analytics.manage', 'View analytics data'),
  ('View analytics', 'analytics.view', 'View analytics dashboard'),
  ('Manage settings', 'settings.manage', 'Manage system settings'),
  ('View settings', 'settings.view', 'View system settings'),
  ('Create users', 'users.create', 'Create new user accounts'),
  ('Manage users', 'users.manage', 'Manage user accounts'),
  ('Assign roles', 'roles.assign', 'Assign roles to users'),
  ('Export data', 'data.export', 'Export reports and data'),
  ('View audit logs', 'audit.logs', 'View audit trail'),
  ('Manage quotes', 'quotes.manage', 'Manage quotes and proposals'),
  ('View quotes', 'quotes.view', 'View quotes'),
  ('Send messages', 'messages.send', 'Send messages to clients/employees'),
  ('View messages', 'messages.view', 'View messages'),
  ('Generate reports', 'reports.generate', 'Generate business reports')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- SUPER_ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- CEO gets most permissions except user management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'CEO'
  AND p.code NOT IN ('users.create', 'users.manage', 'roles.assign')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- PROJECT_MANAGER gets project and task permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'PROJECT_MANAGER'
  AND p.code IN ('projects.manage', 'projects.view', 'tasks.manage', 'tasks.view', 'milestones.view', 'quotes.manage', 'quotes.view')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- DEVELOPER gets development-related permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'DEVELOPER'
  AND p.code IN ('projects.view', 'tasks.view', 'milestones.view', 'analytics.view', 'reports.generate')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- DESIGNER gets design-related permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'DESIGNER'
  AND p.code IN ('projects.view', 'tasks.view', 'blog.manage', 'blog.view', 'design-related permissions would be here')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- SALES gets sales-related permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'SALES'
  AND p.code IN ('leads.manage', 'leads.view', 'quotes.manage', 'quotes.view', 'customers.support')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- FINANCE gets finance-related permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'FINANCE'
  AND p.code IN ('finance.manage', 'finance.view', 'invoices.manage', 'invoices.view', 'payments.view', 'reports.generate')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- HR gets HR-related permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'HR'
  AND p.code IN ('employees.manage', 'employees.view', 'departments.manage', 'departments.view')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- CUSTOMER_SUPPORT gets support permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'CUSTOMER_SUPPORT'
  AND p.code IN ('messages.send', 'messages.view', 'leads.view', 'tickets.manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create departments
INSERT INTO departments (name, code, description) VALUES
  ('Executive', 'EXEC', 'Executive leadership team'),
  ('Technology', 'TECH', 'Software development and engineering'),
  ('Design', 'DESIGN', 'Visual and UX/UI design'),
  ('Sales & Marketing', 'SALES', 'Business development and marketing'),
  ('Operations', 'OPS', 'Day-to-day operations'),
  ('Customer Success', 'CS', 'Client success and support'),
  ('Finance', 'FIN', 'Financial management'),
  ('Human Resources', 'HR', 'Human resources and recruiting'),
  ('Research & Innovation', 'R&D', 'Innovation and R&D initiatives')
ON CONFLICT (name) DO NOTHING;

-- Set up admin user profile
-- This should be run after creating the admin user in Supabase Auth.
-- NOTE: profiles has no email column (email lives in auth.users).
-- Replace <AUTH_USER_UUID> with the user's id from Authentication > Users.
-- UPDATE profiles SET role = 'SUPER_ADMIN', full_name = 'System Administrator'
-- WHERE id = '<AUTH_USER_UUID>';
-- Or simply run: node scripts/setup-db.js

-- Set admin employee record
INSERT INTO employees (user_id, employee_id, department_id, position, employment_status, start_date)
SELECT id, 'EMP-001', id, 'System Administrator', 'ACTIVE', '2024-01-01'
FROM departments WHERE code = 'EXEC';

SELECT 'Seed data initialized successfully!' AS message;