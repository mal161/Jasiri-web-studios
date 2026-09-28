const { getUserClient } = require('../utils/supabase');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization header required' });
    }
    const token = header.slice(7);
    // Request-scoped client: PostgREST/RLS sees the caller's identity
    const supabase = getUserClient(token);
    const { data, error } = await supabase.auth.getUser(token);
    const user = data && data.user ? data.user : null;
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) {
      return res.status(401).json({ success: false, error: 'Profile not found' });
    }
    req.user = { user, profile };
    req.db = supabase;
    return next();
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user && req.user.profile ? req.user.profile.role : null;
    if (!role) return res.status(401).json({ success: false, error: 'Authentication required' });
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
