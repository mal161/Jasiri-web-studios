'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Loader2, AlertTriangle, FolderKanban, Wallet, Bell, ArrowRight } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase';

type Project = { id: string | number; title: string; status: string; slug: string };
type Invoice = { id: string | number; invoice_number: string; status: string; total: number; currency: string; due_date?: string | null };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function ClientPortalPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [unread, setUnread] = useState(0);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
      const userId = session?.user?.id;
      if (!userId) throw new Error('not signed in');
      const [pRes, iRes, nRes] = await Promise.all([
        fetch(`${API}/api/v1/projects?member=${userId}&limit=20`, { headers }),
        fetch(`${API}/api/v1/invoices/mine`, { headers }),
        fetch(`${API}/api/v1/notifications/unread-count`, { headers })
      ]);
      if (!pRes.ok) throw new Error('projects failed');
      const pJson = await pRes.json();
      setProjects(pJson.data ?? []);
      if (iRes.ok) setInvoices((await iRes.json()).data ?? []);
      if (nRes.ok) setUnread((await nRes.json()).data?.unread_count ?? 0);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const outstanding = invoices
    .filter((i) => ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status))
    .reduce((s, i) => s + Number(i.total || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><Building2 size={22} className="text-primary" /> Client Portal</h1>
        <p className="mt-1 text-sm text-text-secondary">Your projects, milestones, files, messages, and invoices — nothing else. Scoped to your membership.</p>
      </div>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading your portal...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Sign in as a client assigned to a project to see your portal.</p></Card>}
      {state === 'ready' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardTitle className="flex items-center gap-2 text-sm"><FolderKanban size={15} className="text-primary" /> Active projects</CardTitle><CardDescription><span className="text-2xl font-bold text-text-primary">{projects.length}</span></CardDescription></Card>
            <Card><CardTitle className="flex items-center gap-2 text-sm"><Wallet size={15} className="text-primary" /> Outstanding</CardTitle><CardDescription><span className="text-2xl font-bold text-text-primary">${outstanding.toLocaleString()}</span> <span className="caption">across {invoices.length} invoice(s)</span></CardDescription></Card>
            <Card><CardTitle className="flex items-center gap-2 text-sm"><Bell size={15} className="text-primary" /> Unread notifications</CardTitle><CardDescription><span className="text-2xl font-bold text-text-primary">{unread}</span></CardDescription></Card>
          </div>
          {invoices.length > 0 && (
            <Card>
              <CardTitle className="flex items-center gap-2 text-sm"><Wallet size={15} className="text-primary" /> Your invoices</CardTitle>
              <ul className="mt-3 divide-y divide-border text-sm">
                {invoices.map((inv) => (
                  <li key={String(inv.id)} className="flex items-center justify-between gap-3 py-2">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="font-medium text-primary hover:underline">{inv.invoice_number}</Link>
                    <span className="flex items-center gap-2">
                      <Badge tone={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'danger' : 'info'}>{inv.status.replace('_', ' ')}</Badge>
                      <span className="text-text-primary">{inv.currency} {Number(inv.total).toLocaleString()}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <Card key={String(p.id)}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-text-primary">{p.title}</h2>
                  <Badge tone={p.status === 'COMPLETED' || p.status === 'LIVE' ? 'success' : 'info'}>{p.status.replace('_', ' ')}</Badge>
                </div>
                <Link href={`/dashboard/projects/${p.id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
                  Open workspace <ArrowRight size={14} />
                </Link>
              </Card>
            ))}
            {projects.length === 0 && (
              <Card><p className="text-sm text-text-secondary">No projects assigned yet. Once added to a project, milestones, files, messages, and invoices appear here.</p></Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
