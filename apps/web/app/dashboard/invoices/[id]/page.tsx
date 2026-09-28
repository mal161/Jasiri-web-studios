'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, ReceiptText, CircleDollarSign, Check } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

type Item = { id: string | number; description: string; quantity: number; unit_price: number; total_price: number };
type Payment = { id: string | number; amount: number; payment_method?: string | null; created_at: string };
type Invoice = {
  id: string | number;
  invoice_number: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  due_date?: string | null;
  items?: Item[];
  payments?: Payment[];
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/api/v1/invoices/${params.id}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      if (!res.ok) throw new Error('fetch failed');
      setInvoice((await res.json()).data);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function markPaid() {
    if (!invoice || !confirm(`Mark invoice ${invoice.invoice_number} as PAID?`)) return;
    setMarking(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/api/v1/invoices/${params.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ status: 'PAID', amount: invoice.total, payment_method: 'Bank Transfer' })
      });
      if (!res.ok) throw new Error('update failed');
      load();
    } finally {
      setMarking(false);
    }
  }

  if (state === 'loading') return <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading invoice...</p></Card>;
  if (state === 'error' || !invoice) return <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Invoice not found or access denied.</p></Card>;

  return (
    <div className="space-y-5">
      <Link href="/dashboard/invoices" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"><ArrowLeft size={14} /> All invoices</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><ReceiptText size={22} className="text-primary" /> {invoice.invoice_number}</h1>
        <div className="flex items-center gap-2">
          <Badge tone={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'danger' : 'info'}>{invoice.status.replace('_', ' ')}</Badge>
          {invoice.status !== 'PAID' && <Button size="sm" onClick={markPaid} loading={marking}><Check size={14} /> Mark Paid</Button>}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="text-sm">Line items</CardTitle>
          <ul className="mt-3 divide-y divide-border text-sm">
            {(invoice.items ?? []).map((i) => (
              <li key={String(i.id)} className="flex items-center justify-between gap-3 py-2">
                <span className="text-text-primary">{i.description} <span className="caption">× {i.quantity}</span></span>
                <span className="text-text-primary">{invoice.currency} {Number(i.total_price).toLocaleString()}</span>
              </li>
            ))}
            {(invoice.items ?? []).length === 0 && <li className="caption py-2">No line items.</li>}
          </ul>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-text-secondary"><dt>Subtotal</dt><dd className="text-text-primary">{invoice.currency} {Number(invoice.subtotal).toLocaleString()}</dd></div>
            <div className="flex justify-between text-text-secondary"><dt>Tax</dt><dd className="text-text-primary">{invoice.currency} {Number(invoice.tax).toLocaleString()}</dd></div>
            <div className="flex justify-between text-text-secondary"><dt>Discount</dt><dd className="text-text-primary">{invoice.currency} {Number(invoice.discount).toLocaleString()}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold text-text-primary"><dt>Total</dt><dd>{invoice.currency} {Number(invoice.total).toLocaleString()}</dd></div>
          </dl>
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-2 text-sm"><CircleDollarSign size={15} className="text-primary" /> Payments ({invoice.payments?.length ?? 0})</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {(invoice.payments ?? []).map((p) => (
              <li key={String(p.id)} className="flex items-center justify-between gap-2">
                <span className="text-text-primary">{p.payment_method ?? 'Payment'}</span>
                <span className="text-text-secondary">{invoice.currency} {Number(p.amount).toLocaleString()}</span>
              </li>
            ))}
            {(invoice.payments ?? []).length === 0 && <li className="caption">No payments recorded.</li>}
          </ul>
          {invoice.due_date && <p className="caption mt-4">Due {new Date(invoice.due_date).toLocaleDateString()}</p>}
        </Card>
      </div>
    </div>
  );
}
