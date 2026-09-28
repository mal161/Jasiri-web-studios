const express = require('express');
const { z } = require('zod');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();

const signInSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2)
});

function ok(res, data) {
  return res.json({ success: true, data });
}
function fail(res, status, message) {
  return res.status(status).json({ success: false, error: message });
}

router.post('/signin', async (req, res) => {
  try {
    const parsed = signInSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, 'Invalid email or password');
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return fail(res, 400, error.message);
    return ok(res, data);
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/signup', async (req, res) => {
  try {
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, 'Invalid signup data');
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password
    });
    if (error) return fail(res, 400, error.message);
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: parsed.data.full_name,
        role: 'CLIENT'
      });
    }
    return ok(res, data);
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

router.post('/signout', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) return fail(res, 400, error.message);
    return ok(res, null);
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
