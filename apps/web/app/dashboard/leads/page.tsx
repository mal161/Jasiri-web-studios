'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TRow, TH, TD, EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Lead = { id: string | number; name: string; email: string; company?: string | null; status: string; source?: string | null; created_at: string };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/leads?limit=50`, {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
        });
        if (!res.ok) throw new Error('fetch failed');
        const json = await res.json();
        setLeads(json.data ?? []);
        setState('ready');
      } catch {
        setState('error');
      }
    }
    load();
  }, []);

  const filtered = leads.filter((l) => !query || `${l.name} ${l.email} ${l.company ?? ''}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><Users size={22} className="text-primary" /> Leads</h1>
        <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
          <Search size={15} className="text-text-secondary" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search leads..." className="bg-transparent outline-none placeholder:text-text-secondary" aria-label="Search leads" />
        </label>
      </div>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading leads...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Could not load leads. Start the API and sign in with a staff role.</p></Card>}
      {state === 'ready' && filtered.length === 0 && <EmptyState title="No leads yet" description="New contact, quote, and consultation submissions appear here automatically." />}
      {state === 'ready' && filtered.length > 0 && (
        <Table>
          <THead><TRow><TH>Name</TH><TH>Status</TH><TH>Source</TH><TH>Created</TH><TH><span className="sr-only">Open</span></TH></TRow></THead>
          <tbody>
            {filtered.map((l) => (
              <TRow key={String(l.id)}>
                <TD><p className="font-medium">{l.name}</p><p className="caption">{l.email}{l.company ? ` · ${l.company}` : ''}</p></TD>
                <TD><Badge tone={l.status === 'NEW' ? 'info' : l.status === 'CONVERTED' ? 'success' : l.status === 'LOST' ? 'danger' : 'default'}>{l.status}</Badge></TD>
                <TD>{l.source ?? '—'}</TD>
                <TD>{new Date(l.created_at).toLocaleDateString()}</TD>
                <TD><Link href={`/dashboard/leads/${l.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">Open <ArrowRight size={13} /></Link></TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
