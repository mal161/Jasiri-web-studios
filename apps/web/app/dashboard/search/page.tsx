'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, AlertTriangle, FolderKanban, Users, FileText, ListTodo, ReceiptText, ArrowRight } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Results = {
  projects: { id: string | number; title: string; slug: string }[];
  leads: { id: string | number; name: string; email: string }[];
  posts: { id: string | number; title: string; slug: string }[];
  tasks: { id: string | number; title: string }[];
  invoices: { id: string | number; invoice_number: string }[];
};

function SearchResults() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const [data, setData] = useState<Results | null>(null);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(async () => {
    if (q.trim().length < 2) {
      setState('ready');
      return;
    }
    setState('loading');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/search?q=${encodeURIComponent(q)}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      if (!res.ok) throw new Error('fetch failed');
      setData((await res.json()).data);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const total = data ? data.projects.length + data.leads.length + data.posts.length + data.tasks.length + data.invoices.length : 0;

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><Search size={22} className="text-primary" /> Results for “{q}”</h1>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Searching...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Search requires a staff account and a running API.</p></Card>}
      {state === 'ready' && (!data || total === 0) && <EmptyState title="No matches" description="Try at least 2 characters. Search covers projects, leads, posts, tasks, and invoices." />}
      {state === 'ready' && data && total > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardTitle className="flex items-center gap-2 text-sm"><FolderKanban size={15} className="text-primary" /> Projects ({data.projects.length})</CardTitle>
            <ul className="mt-2 space-y-1.5 text-sm">
              {data.projects.map((p) => <li key={String(p.id)}><Link href={`/dashboard/projects/${p.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">{p.title} <ArrowRight size={12} /></Link></li>)}
            </ul>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2 text-sm"><Users size={15} className="text-primary" /> Leads ({data.leads.length})</CardTitle>
            <ul className="mt-2 space-y-1.5 text-sm">
              {data.leads.map((l) => <li key={String(l.id)}><Link href={`/dashboard/leads/${l.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">{l.name} <ArrowRight size={12} /></Link></li>)}
            </ul>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2 text-sm"><ListTodo size={15} className="text-primary" /> Tasks ({data.tasks.length})</CardTitle>
            <ul className="mt-2 space-y-1.5 text-sm">
              {data.tasks.map((t) => <li key={String(t.id)} className="text-text-primary">{t.title}</li>)}
            </ul>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2 text-sm"><FileText size={15} className="text-primary" /> Posts ({data.posts.length})</CardTitle>
            <ul className="mt-2 space-y-1.5 text-sm">
              {data.posts.map((p) => <li key={String(p.id)}><Link href={`/blog/${p.slug}`} className="inline-flex items-center gap-1 text-primary hover:underline">{p.title} <ArrowRight size={12} /></Link></li>)}
            </ul>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2 text-sm"><ReceiptText size={15} className="text-primary" /> Invoices ({data.invoices.length})</CardTitle>
            <ul className="mt-2 space-y-1.5 text-sm">
              {data.invoices.map((i) => <li key={String(i.id)}><Link href={`/dashboard/invoices/${i.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">{i.invoice_number} <ArrowRight size={12} /></Link></li>)}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Card><p className="text-sm text-text-secondary">Loading search...</p></Card>}>
      <SearchResults />
    </Suspense>
  );
}
