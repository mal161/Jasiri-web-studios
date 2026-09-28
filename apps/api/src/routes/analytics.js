const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');
const { analyticsEventSchema } = require('../../../../packages/validation');

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const parsed = analyticsEventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid analytics event' });
    const supabase = req.db || getSupabase();
    const e = parsed.data;
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: e.event_name,
        page: e.page ?? null,
        project_id: e.project_id ?? null,
        session_id: e.session_id ?? null,
        user_id: req.user.profile.id,
        referrer: e.referrer ?? null,
        device_type: e.device_type ?? null,
        browser: e.browser ?? null,
        operating_system: e.operating_system ?? null,
        country: e.country ?? null,
        metadata: e.metadata ?? {}
      })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

function startForRange(range) {
  const now = Date.now();
  const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '90d' ? 90 : 30;
  return new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
}

router.get('/summary', authenticate, authorize('SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'FINANCE', 'ADMIN'), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const range = typeof req.query.timeRange === 'string' ? req.query.timeRange : '30d';
    const start = startForRange(range);

    const [pageViews, projectViews, leads, quotes] = await Promise.all([
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_name', 'PAGE_VIEW').gte('timestamp', start),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_name', 'PROJECT_VIEW').gte('timestamp', start),
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', start),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_name', 'QUOTE_COMPLETED').gte('timestamp', start)
    ]);

    const { data: daily } = await supabase
      .from('analytics_events')
      .select('timestamp,event_name')
      .eq('event_name', 'PAGE_VIEW')
      .gte('timestamp', start)
      .order('timestamp', { ascending: true })
      .limit(2000);

    const { data: topProjects } = await supabase
      .from('analytics_events')
      .select('project_id')
      .eq('event_name', 'PROJECT_VIEW')
      .gte('timestamp', start)
      .limit(500);

    return res.json({
      success: true,
      data: {
        time_range: range,
        kpis: {
          page_views: pageViews.count ?? 0,
          project_views: projectViews.count ?? 0,
          leads: leads.count ?? 0,
          quotes_completed: quotes.count ?? 0
        },
        daily_views: daily ?? [],
        top_project_ids: topProjects ?? []
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
