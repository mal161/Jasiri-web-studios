'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, FileSignature, Rocket, Check } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase';

type Item = { id: string | number; description: string; quantity: number; unit_price: number; total_price: number };
type Quote = { id: string | number; quote_number: string; status: string; notes?: string | null; items?: Item[] };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [projectTitle, setProjectTitle] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertedId, setConvertedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`${API}/api/v1/quotes/${params.id}`, { headers: await authHeaders() });
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setQuote(json.data);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(status: string) {
    setError(null);
    setWorking(true);
    try {
      const res = await fetch(`${API}/api/v1/quotes/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Status update failed');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setWorking(false);
    }
  }

  async function convert(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setWorking(true);
    try {
      const res = await fetch(`${API}/api/v1/quotes/${params.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ title: projectTitle || undefined })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Conversion failed');
      setConvertedId(String(json.data.project.id));
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setWorking(false);
    }
  }

  if (state === 'loading') return <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading quote...</p></Card>;
  if (state === 'error' || !quote) return <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Quote not found or access denied.</p></Card>;

  const total = (quote.items ?? []).reduce((s, i) => s + Number(i.total_price || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/quotes" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"><ArrowLeft size={14} /> All quotes</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><FileSignature size={22} className="text-primary" /> {quote.quote_number}</h1>
          <Badge tone={quote.status === 'ACCEPTED' ? 'success' : quote.status === 'REJECTED' ? 'danger' : 'info'}>{quote.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="text-sm">Line items</CardTitle>
          <ul className="mt-3 divide-y divide-border text-sm">
            {(quote.items ?? []).map((i) => (
              <li key={String(i.id)} className="flex items-center justify-between gap-3 py-2">
                <span className="text-text-primary">{i.description} <span className="caption">× {i.quantity}</span></span>
                <span className="text-text-primary">${Number(i.total_price).toLocaleString()}</span>
              </li>
            ))}
            {(quote.items ?? []).length === 0 && <li className="caption py-2">No line items.</li>}
          </ul>
          <p className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold text-text-primary"><span>Total</span><span>${total.toLocaleString()}</span></p>
          {quote.notes && <p className="mt-3 text-sm text-text-secondary">{quote.notes}</p>}
        </Card>
        <div className="space-y-4">
          <Card>
            <CardTitle className="text-sm">Pipeline</CardTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map((s) => (
                <Button key={s} size="sm" variant={quote.status === s ? 'primary' : 'secondary'} onClick={() => setStatus(s)} loading={working}>
                  {s === 'ACCEPTED' && <Check size={13} />} {s}
                </Button>
              ))}
            </div>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2 text-sm"><Rocket size={15} className="text-primary" /> Convert to project</CardTitle>
            {convertedId ? (
              <p className="mt-2 text-sm text-success">Created project <Link href={`/dashboard/projects/${convertedId}`} className="font-medium text-primary underline">#{convertedId}</Link></p>
            ) : (
              <form onSubmit={convert} className="mt-3 space-y-3">
                <Input label="Project title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder={`Project from ${quote.quote_number}`} />
                <Button type="submit" loading={working} className="w-full"><Rocket size={14} /> Create Project</Button>
              </form>
            )}
          </Card>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
