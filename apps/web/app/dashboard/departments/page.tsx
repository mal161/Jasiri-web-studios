'use client';

import { useCallback, useEffect, useState } from 'react';
import { Network, Loader2, AlertTriangle } from 'lucide-react';
import { DepartmentForm } from '@/features/hr/DepartmentForm';
import { Card } from '@/components/ui/Card';
import { Table, THead, TRow, TH, TD, EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Department = { id: string | number; name: string; code: string; description?: string | null };

export default function DepartmentsPage() {
  const [rows, setRows] = useState<Department[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/departments`, {
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
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><Network size={22} className="text-primary" /> Departments</h1>
        <DepartmentForm onCreated={load} />
      </div>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading departments...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> HR access required. Sign in with an HR/admin account.</p></Card>}
      {state === 'ready' && rows.length === 0 && <EmptyState title="No departments" description="Departments seeded from the database appear here." />}
      {state === 'ready' && rows.length > 0 && (
        <Table>
          <THead><TRow><TH>Name</TH><TH>Code</TH><TH>Description</TH></TRow></THead>
          <tbody>
            {rows.map((d) => (
              <TRow key={String(d.id)}>
                <TD><span className="font-medium">{d.name}</span></TD>
                <TD>{d.code}</TD>
                <TD>{d.description ?? '—'}</TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
