-- Migration 005: default currency KES (Kenyan Shilling).
-- Run in Supabase Dashboard > SQL Editor. Idempotent.
ALTER TABLE invoices ALTER COLUMN currency SET DEFAULT 'KES';
