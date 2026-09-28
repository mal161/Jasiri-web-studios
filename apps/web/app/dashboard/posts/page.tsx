'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Loader2, AlertTriangle, ArrowUpRight, Eye, EyeOff, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, THead, TRow, TH, TD, EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Post = { id: string | number; title: string; slug: string; status: string; published_at?: string | null };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function PostsAdminPage() {
  const [rows, setRows] = useState<Post[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const params = new URLSearchParams({ admin: 'true' });
      if (filter) params.set('status', filter);
      const res = await fetch(`${API}/api/v1/posts?${params.toString()}`, { headers: await authHeaders() });
      if (!res.ok) throw new Error('fetch failed');
      setRows((await res.json()).data ?? []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string | number, status: string) {
    const res = await fetch(`${API}/api/v1/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ status })
    });
    if (res.ok) load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><FileText size={22} className="text-primary" /> Blog CMS</h1>
        <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
          <Filter size={14} className="text-text-secondary" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-transparent outline-none" aria-label="Filter by status">
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
      </div>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading posts...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> CMS requires a staff account and a running API.</p></Card>}
      {state === 'ready' && rows.length === 0 && <EmptyState title="No posts" description="Publishing here updates the public blog instantly." />}
      {state === 'ready' && rows.length > 0 && (
        <Table>
          <THead><TRow><TH>Title</TH><TH>Status</TH><TH>Published</TH><TH><span className="sr-only">Actions</span></TH></TRow></THead>
          <tbody>
            {rows.map((p) => (
              <TRow key={String(p.id)}>
                <TD><p className="font-medium">{p.title}</p><p className="caption">/{p.slug}</p></TD>
                <TD><Badge tone={p.status === 'PUBLISHED' ? 'success' : p.status === 'ARCHIVED' ? 'default' : 'warning'}>{p.status}</Badge></TD>
                <TD>{p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}</TD>
                <TD>
                  <span className="flex items-center gap-2">
                    {p.status === 'PUBLISHED' ? (
                      <Button size="sm" variant="secondary" onClick={() => setStatus(p.id, 'ARCHIVED')}><EyeOff size={13} /> Unpublish</Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setStatus(p.id, 'PUBLISHED')}><Eye size={13} /> Publish</Button>
                    )}
                    <Link href={`/blog/${p.slug}`} className="inline-flex items-center gap-0.5 text-sm text-primary"><ArrowUpRight size={14} /></Link>
                  </span>
                </TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
