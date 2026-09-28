'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileSignature, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { QuoteForm } from '@/features/quotes/QuoteForm';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TRow, TH, TD, EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Quote = { id: string | number; quote_number: string; status: string; created_at: string; expiry_date?: string | null };

const tones: Record<string, string> = { DRAFT: 'default', SENT: 'info', ACCEPTED: 'success', REJECTED: 'danger', EXPIRED: 'warning' };

export default function QuotesPage() {
  const [rows, setRows] = useState<Quote[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/quotes`, {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><FileSignature size={22} className="text-primary" /> Quotes</h1>
        <QuoteForm onCreated={load} />
      </div>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading quotes...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Quotes require a staff account and a running API.</p></Card>}
      {state === 'ready' && rows.length === 0 && <EmptyState title="No quotes" description="Quotes sent to leads appear here. Accepted quotes convert into projects." />}
      {state === 'ready' && rows.length > 0 && (
        <Table>
          <THead><TRow><TH>Quote</TH><TH>Status</TH><TH>Created</TH><TH><span className="sr-only">Open</span></TH></TRow></THead>
          <tbody>
            {rows.map((q) => (
              <TRow key={String(q.id)}>
                <TD><p className="font-medium">{q.quote_number}</p>{q.expiry_date && <p className="caption">Expires {new Date(q.expiry_date).toLocaleDateString()}</p>}</TD>
                <TD><Badge tone={tones[q.status] ?? 'default'}>{q.status}</Badge></TD>
                <TD>{new Date(q.created_at).toLocaleDateString()}</TD>
                <TD><Link href={`/dashboard/quotes/${q.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">Open <ArrowRight size={13} /></Link></TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
