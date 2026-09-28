// One-time database setup for Jasiri Platform.
// Usage: node scripts/setup-db.js
// Uses SUPABASE_SERVICE_ROLE_KEY from root .env. Idempotent — safe to re-run.
require('dotenv').config();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAIL = 'alekimaleki123@gmail.com';
const ADMIN_NAME = 'Alex Mwangi';

const ROLES = [
  ['SUPER_ADMIN', 'Super administrator with full access'],
  ['CEO', 'Chief Executive Officer'],
  ['OPERATIONS_MANAGER', 'Operations manager'],
  ['PROJECT_MANAGER', 'Project manager'],
  ['DEVELOPER', 'Software developer'],
  ['DESIGNER', 'Designer'],
  ['SALES', 'Sales representative'],
  ['FINANCE', 'Finance team'],
  ['HR', 'Human resources'],
  ['CUSTOMER_SUPPORT', 'Customer support'],
  ['CLIENT', 'Client user']
];

const PERMISSIONS = [
  ['View dashboard', 'dashboard.view'], ['Manage projects', 'projects.manage'], ['View projects', 'projects.view'],
  ['Manage leads', 'leads.manage'], ['View leads', 'leads.view'],
  ['Manage clients', 'clients.manage'], ['View clients', 'clients.view'],
  ['Manage employees', 'employees.manage'], ['View employees', 'employees.view'],
  ['Manage departments', 'departments.manage'], ['View departments', 'departments.view'],
  ['Manage blog', 'blog.manage'], ['View blog', 'blog.view'],
  ['Manage finance', 'finance.manage'], ['View finance', 'finance.view'],
  ['Manage analytics', 'analytics.manage'], ['View analytics', 'analytics.view'],
  ['Manage settings', 'settings.manage'], ['View settings', 'settings.view'],
  ['Create users', 'users.create'], ['Manage users', 'users.manage'], ['Assign roles', 'roles.assign'],
  ['Export data', 'data.export'], ['View audit logs', 'audit.logs'],
  ['Manage quotes', 'quotes.manage'], ['View quotes', 'quotes.view'],
  ['Send messages', 'messages.send'], ['View messages', 'messages.view'],
  ['Generate reports', 'reports.generate']
];

const DEPARTMENTS = [
  ['Executive', 'EXEC', 'Executive leadership team'],
  ['Technology', 'TECH', 'Software development and engineering'],
  ['Design', 'DESIGN', 'Visual and UX/UI design'],
  ['Sales & Marketing', 'SALES', 'Business development and marketing'],
  ['Operations', 'OPS', 'Day-to-day operations'],
  ['Customer Success', 'CS', 'Client success and support'],
  ['Finance', 'FIN', 'Financial management'],
  ['Human Resources', 'HR', 'Human resources and recruiting'],
  ['Research & Innovation', 'R&D', 'Innovation and R&D initiatives']
];

const CATEGORIES = [
  ['Web Application', 'web-application', 'Custom web apps and platforms'],
  ['E-commerce', 'ecommerce', 'Online stores and marketplaces'],
  ['Marketing Site', 'marketing-site', 'Business and corporate websites'],
  ['SaaS', 'saas', 'Software-as-a-service products'],
  ['Brand & Design', 'brand-design', 'Identity and product design']
];

const BUCKETS = [
  ['project-assets', false], ['avatars', false], ['blog', true], ['invoices', false], ['documents', false]
];

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const log = (m) => console.log(`[setup] ${m}`);

  // 1. Admin auth user (create or reuse)
  let userId;
  let password = null;
  const { data: existing } = await sb.auth.admin.listUsers();
  const found = (existing?.users ?? []).find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
  if (found) {
    userId = found.id;
    log(`Auth user already exists (${ADMIN_EMAIL}, id ${userId})`);
  } else {
    password = crypto.randomBytes(12).toString('base64url');
    const { data, error } = await sb.auth.admin.createUser({ email: ADMIN_EMAIL, password, email_confirm: true, user_metadata: { full_name: ADMIN_NAME } });
    if (error) throw new Error('createUser: ' + error.message);
    userId = data.user.id;
    log(`Auth user created (${ADMIN_EMAIL})`);
  }

  // 2. Profile -> SUPER_ADMIN (profiles has no email column — email lives in auth.users)
  const { error: pErr } = await sb.from('profiles').upsert(
    { id: userId, full_name: ADMIN_NAME, role: 'SUPER_ADMIN', title: 'Founder & Lead Engineer', status: 'ACTIVE', updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  );
  if (pErr) throw new Error('profile upsert: ' + pErr.message);
  log('Profile set to SUPER_ADMIN');

  // 3. Roles
  for (const [name, description] of ROLES) {
    const { error } = await sb.from('roles').upsert({ name, description }, { onConflict: 'name' });
    if (error) throw new Error('roles: ' + error.message);
  }
  log(`Roles seeded (${ROLES.length})`);

  // 4. Permissions
  for (const [name, code] of PERMISSIONS) {
    const { error } = await sb.from('permissions').upsert({ name, code, description: name }, { onConflict: 'code' });
    if (error) throw new Error('permissions: ' + error.message);
  }
  log(`Permissions seeded (${PERMISSIONS.length})`);

  // 5. SUPER_ADMIN <- all permissions
  const { data: sRole } = await sb.from('roles').select('id').eq('name', 'SUPER_ADMIN').single();
  const { data: perms } = await sb.from('permissions').select('id');
  const { data: existingPairs } = await sb.from('role_permissions').select('permission_id').eq('role_id', sRole.id);
  const have = new Set((existingPairs ?? []).map((r) => r.permission_id));
  const missing = (perms ?? []).filter((p) => !have.has(p.id)).map((p) => ({ role_id: sRole.id, permission_id: p.id }));
  if (missing.length > 0) {
    const { error } = await sb.from('role_permissions').insert(missing);
    if (error) throw new Error('role_permissions: ' + error.message);
  }
  log(`SUPER_ADMIN permissions linked (${(perms ?? []).length} total)`);

  // 6. Departments
  for (const [name, code, description] of DEPARTMENTS) {
    const { error } = await sb.from('departments').upsert({ name, code, description }, { onConflict: 'name' });
    if (error) throw new Error('departments: ' + error.message);
  }
  log(`Departments seeded (${DEPARTMENTS.length})`);

  // 7. Employee record for admin
  const { data: exec } = await sb.from('departments').select('id').eq('code', 'EXEC').single();
  const { data: existingEmp } = await sb.from('employees').select('id').eq('user_id', userId).limit(1);
  if (existingEmp && existingEmp.length > 0) {
    log('Employee record already exists');
  } else {
    const { error: eErr } = await sb.from('employees').insert(
      { user_id: userId, employee_id: 'EMP-001', department_id: exec?.id ?? null, position: 'Founder & Lead Engineer', employment_status: 'ACTIVE', start_date: new Date().toISOString().slice(0, 10) }
    );
    if (eErr) log('Employee insert note: ' + eErr.message);
    else log('Employee record EMP-001 ready');
  }

  // 8. Categories
  for (const [name, slug, description] of CATEGORIES) {
    const { error } = await sb.from('categories').upsert({ name, slug, description }, { onConflict: 'slug' });
    if (error) throw new Error('categories: ' + error.message);
  }
  log(`Categories seeded (${CATEGORIES.length})`);

  // 9. Company settings
  const { error: sErr } = await sb.from('settings').upsert(
    { key: 'company', value: { name: 'Jasiri Web Studios', email: 'hello@jasiri.studio', location: 'Nairobi, Kenya' }, category: 'company' },
    { onConflict: 'key' }
  );
  if (sErr) throw new Error('settings: ' + sErr.message);
  log('Company settings saved');

  // 10. Storage buckets
  for (const [name, isPublic] of BUCKETS) {
    const { error } = await sb.storage.createBucket(name, { public: isPublic });
    if (error && !String(error.message).toLowerCase().includes('already exists')) throw new Error(`bucket ${name}: ` + error.message);
  }
  log(`Storage buckets ready (${BUCKETS.map((b) => b[0]).join(', ')})`);

  // 11. Audit trail
  await sb.from('audit_logs').insert({ user_id: userId, action: 'USER_CREATED', resource_type: 'profiles', resource_id: userId, metadata: { role: 'SUPER_ADMIN', via: 'setup-db.js' } });

  console.log('\nDone. Sign in at http://localhost:3000/login with:');
  console.log(`  email:    ${ADMIN_EMAIL}`);
  console.log(password ? `  password: ${password}  (generated — store it safely, this is shown only once)` : '  password: (existing user — use your current password)');
}

main().catch((e) => {
  console.error('[setup] FAILED:', e.message);
  process.exitCode = 1;
});
