'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Wallet, Loader2, AlertTriangle, ArrowRight, Filter } from 'lucide-react';
import { InvoiceForm } from '@/features/finance/InvoiceForm';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TRow, TH, TD, EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Invoice = { id: string | number; invoice_number: string; status: string; total: number; currency: string; due_date?: string | null; issued_date?: string | null };

const tones: Record<string, string> = { DRAFT: 'default', SENT: 'info', PARTIALLY_PAID: 'warning', PAID: 'success', OVERDUE: 'danger', CANCELLED: 'default' };
const STATUSES = ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const params = status ? `?status=${status}` : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/invoices${params}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      if (!res.ok) throw new Error('fetch failed');
      setInvoices((await res.json()).data ?? []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const outstanding = invoices.filter((i) => ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status)).reduce((s, i) => s + Number(i.total || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><Wallet size={22} className="text-primary" /> Finance</h1>
        <div className="flex items-center gap-2">
          <InvoiceForm onCreated={load} />
          <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
          <Filter size={14} className="text-text-secondary" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-transparent outline-none" aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          </label>
        </div>
      </div>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading invoices...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Finance requires a finance-role account and a running API.</p></Card>}
      {state === 'ready' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><p className="caption">OUTSTANDING</p><p className="text-2xl font-bold text-text-primary">KSh {outstanding.toLocaleString()}</p></Card>
            <Card><p className="caption">INVOICES SHOWN</p><p className="text-2xl font-bold text-text-primary">{invoices.length}</p></Card>
          </div>
          {invoices.length === 0 ? (
            <EmptyState title="No invoices" description="Invoices created via the finance API appear here with status tracking." />
          ) : (
            <Table>
              <THead><TRow><TH>Invoice</TH><TH>Status</TH><TH>Total</TH><TH>Due</TH><TH><span className="sr-only">Open</span></TH></TRow></THead>
              <tbody>
                {invoices.map((inv) => (
                  <TRow key={String(inv.id)}>
                    <TD><p className="font-medium">{inv.invoice_number}</p><p className="caption">Issued {inv.issued_date ? new Date(inv.issued_date).toLocaleDateString() : '—'}</p></TD>
                    <TD><Badge tone={tones[inv.status] ?? 'default'}>{inv.status.replace('_', ' ')}</Badge></TD>
                    <TD>{inv.currency} {Number(inv.total || 0).toLocaleString()}</TD>
                    <TD>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</TD>
                    <TD><Link href={`/dashboard/invoices/${inv.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">Open <ArrowRight size={13} /></Link></TD>
                  </TRow>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
