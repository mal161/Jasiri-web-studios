const { createClient } = require('@supabase/supabase-js');

let cachedAnon = null;
let cachedAdmin = null;

function getSupabase() {
  if (cachedAnon) return cachedAnon;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  cachedAnon = createClient(url, anon);
  return cachedAnon;
}

function getSupabaseAdmin() {
  if (cachedAdmin) return cachedAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  cachedAdmin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
  return cachedAdmin;
}

module.exports = { getSupabase, getSupabaseAdmin };
