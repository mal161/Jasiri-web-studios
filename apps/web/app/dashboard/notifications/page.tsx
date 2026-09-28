'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, Loader2, AlertTriangle, CheckCheck, Inbox } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Notification = { id: string | number; type: string; title: string; message?: string | null; link?: string | null; read: boolean; created_at: string };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function NotificationsPage() {
  const [rows, setRows] = useState<Notification[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`${API}/api/v1/notifications`, { headers: await authHeaders() });
      if (!res.ok) throw new Error('fetch failed');
      setRows((await res.json()).data ?? []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string | number) {
    await fetch(`${API}/api/v1/notifications/${id}/read`, { method: 'PATCH', headers: await authHeaders() });
    load();
  }

  async function markAll() {
    await fetch(`${API}/api/v1/notifications/read-all`, { method: 'PATCH', headers: await authHeaders() });
    load();
  }

  const unread = rows.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><Bell size={22} className="text-primary" /> Notifications {unread > 0 && <Badge tone="primary">{unread} unread</Badge>}</h1>
        {unread > 0 && <Button size="sm" variant="secondary" onClick={markAll}><CheckCheck size={14} /> Mark all read</Button>}
      </div>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading notifications...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Sign in to see your notifications.</p></Card>}
      {state === 'ready' && rows.length === 0 && <EmptyState title="All caught up" description="Lead assignments, task updates, invoices, and deadlines will appear here." />}
      {state === 'ready' && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((n) => (
            <li key={String(n.id)} className={`card flex items-start justify-between gap-3 p-4 ${n.read ? 'opacity-70' : ''}`}>
              <div className="flex items-start gap-3">
                {n.read ? <Inbox size={16} className="mt-0.5 text-text-secondary" /> : <Bell size={16} className="mt-0.5 text-primary" />}
                <div>
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  {n.message && <p className="mt-0.5 text-sm text-text-secondary">{n.message}</p>}
                  <p className="caption mt-1">{n.type} · {new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
              {!n.read && <Button size="sm" variant="secondary" onClick={() => markRead(n.id)}><CheckCheck size={13} /> Read</Button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
