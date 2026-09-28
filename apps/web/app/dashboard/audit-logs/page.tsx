'use client';

import { useCallback, useEffect, useState } from 'react';
import { ScrollText, Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TRow, TH, TD, EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Log = { id: string | number; action: string; resource_type: string; resource_id?: string | null; created_at: string; actor?: { full_name: string } | null };

export default function AuditLogsPage() {
  const [rows, setRows] = useState<Log[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/audit-logs?limit=50`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
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

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><ScrollText size={22} className="text-primary" /> Audit Logs</h1>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading audit trail...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Audit logs require a staff account and a running API.</p></Card>}
      {state === 'ready' && rows.length === 0 && <EmptyState title="No audit events" description="Administrative actions across leads, projects, invoices, and settings are recorded here." />}
      {state === 'ready' && rows.length > 0 && (
        <Table>
          <THead><TRow><TH>Action</TH><TH>Resource</TH><TH>Actor</TH><TH>When</TH></TRow></THead>
          <tbody>
            {rows.map((l) => (
              <TRow key={String(l.id)}>
                <TD><Badge tone="default">{l.action}</Badge></TD>
                <TD><span className="text-sm">{l.resource_type}{l.resource_id ? ` #${l.resource_id}` : ''}</span></TD>
                <TD>{l.actor?.full_name ?? '—'}</TD>
                <TD>{new Date(l.created_at).toLocaleString()}</TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
