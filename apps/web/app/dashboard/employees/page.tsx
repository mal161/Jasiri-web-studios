'use client';

import { useCallback, useEffect, useState } from 'react';
import { Contact2, Loader2, AlertTriangle, Building } from 'lucide-react';
import { EmployeeForm } from '@/features/hr/EmployeeForm';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TRow, TH, TD, EmptyState } from '@/components/ui/Table';
import { createClient } from '@/lib/supabase';

type Employee = {
  id: string | number;
  employee_id?: string | null;
  position?: string | null;
  employment_status: string;
  profile?: { full_name: string; email: string; role: string } | null;
  department?: { name: string } | null;
};

export default function EmployeesPage() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/employees`, {
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
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><Contact2 size={22} className="text-primary" /> Employees</h1>
        <EmployeeForm onCreated={load} />
      </div>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading employees...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> HR access required. Sign in with an HR/admin account.</p></Card>}
      {state === 'ready' && rows.length === 0 && <EmptyState title="No employees" description="Employee records created via the HR API appear here." />}
      {state === 'ready' && rows.length > 0 && (
        <Table>
          <THead><TRow><TH>Employee</TH><TH>Department</TH><TH>Status</TH><TH>Position</TH></TRow></THead>
          <tbody>
            {rows.map((e) => (
              <TRow key={String(e.id)}>
                <TD><p className="font-medium">{e.profile?.full_name ?? e.employee_id ?? '—'}</p><p className="caption">{e.profile?.email ?? ''}</p></TD>
                <TD><span className="inline-flex items-center gap-1 text-sm"><Building size={13} className="text-text-secondary" />{e.department?.name ?? '—'}</span></TD>
                <TD><Badge tone={e.employment_status === 'ACTIVE' ? 'success' : 'default'}>{e.employment_status}</Badge></TD>
                <TD>{e.position ?? '—'}</TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
