-- Migration 004: guarantee public-insert policies for lead capture.
-- Run this in Supabase Dashboard > SQL Editor if the contact form,
-- quote builder, or consultation requests fail with:
--   "new row violates row-level security policy for table \"leads\""
-- Idempotent — safe to run multiple times.

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS leads_public_insert ON leads;
CREATE POLICY leads_public_insert ON leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS quotes_public_insert ON quotes;
CREATE POLICY quotes_public_insert ON quotes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS analytics_insert ON analytics_events;
CREATE POLICY analytics_insert ON analytics_events FOR INSERT WITH CHECK (true);
