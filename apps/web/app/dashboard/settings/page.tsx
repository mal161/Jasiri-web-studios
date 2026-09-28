'use client';

import { useCallback, useEffect, useState } from 'react';
import { Settings as SettingsIcon, Loader2, AlertTriangle, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Setting = { key: string; value: unknown; category: string };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function SettingsPage() {
  const [rows, setRows] = useState<Setting[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`${API}/api/v1/settings`, { headers: await authHeaders() });
      if (!res.ok) throw new Error('fetch failed');
      const data: Setting[] = (await res.json()).data ?? [];
      setRows(data);
      setDrafts(Object.fromEntries(data.map((d) => [d.key, JSON.stringify(d.value, null, 2)])));
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(key: string) {
    setError(null);
    setSaving(key);
    try {
      const parsed = JSON.parse(drafts[key] || '{}');
      const res = await fetch(`${API}/api/v1/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ value: parsed })
      });
      if (!res.ok) throw new Error('Save failed — admin role required');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><SettingsIcon size={22} className="text-primary" /> Settings</h1>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading settings...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Settings require a staff account and a running API.</p></Card>}
      {state === 'ready' && rows.length === 0 && <EmptyState title="No settings yet" description="Company, branding, and notification preferences live in the settings table — never hardcoded." />}
      {state === 'ready' && rows.map((s) => (
        <Card key={s.key}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-sm font-medium text-text-primary">{s.key} <span className="caption font-sans">· {s.category}</span></p>
            <Button size="sm" onClick={() => save(s.key)} loading={saving === s.key}><Save size={13} /> Save</Button>
          </div>
          <textarea
            value={drafts[s.key] ?? ''}
            onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
            rows={4}
            spellCheck={false}
            aria-label={`Value for ${s.key}`}
            className="input mt-3 font-mono text-xs"
          />
        </Card>
      ))}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
