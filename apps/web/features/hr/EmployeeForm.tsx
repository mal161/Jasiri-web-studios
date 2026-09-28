'use client';

import { useEffect, useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type User = { id: string; full_name: string; email: string; role: string };
type Department = { id: number; name: string };

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export function EmployeeForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userId, setUserId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const headers = await authHeaders();
      const [uRes, dRes] = await Promise.all([
        fetch(`${API}/api/v1/users?limit=50`, { headers }),
        fetch(`${API}/api/v1/departments`, { headers })
      ]);
      if (uRes.ok) setUsers((await uRes.json()).data ?? []);
      if (dRes.ok) setDepartments((await dRes.json()).data ?? []);
    })();
  }, [open ]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!userId) {
      setError('Select a user account first — they sign up, then you onboard them here.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/v1/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({
          user_id: userId,
          department_id: departmentId ? Number(departmentId) : undefined,
          position: position || undefined,
          start_date: startDate || undefined
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Create failed — admin role required');
      setOpen(false);
      setUserId('');
      setPosition('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Employee</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Onboard employee">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="emp-user" className="label">User account</label>
            <select id="emp-user" className="input" value={userId} onChange={(e) => setUserId(e.target.value)} required>
              <option value="">Select a signed-up user...</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.full_name} · {u.email} ({u.role})</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="emp-dept" className="label">Department</label>
              <select id="emp-dept" className="input" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">No department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <Input label="Position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Frontend Engineer" />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={saving} className="w-full"><UserPlus size={15} /> Onboard Employee</Button>
        </form>
      </Modal>
    </>
  );
}
