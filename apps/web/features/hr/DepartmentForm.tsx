'use client';

import { useState } from 'react';
import { Plus, Network } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function DepartmentForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/api/v1/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ name, description: description || undefined })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Create failed — admin role required');
      setOpen(false);
      setName('');
      setDescription('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Department</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create department">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Research & Innovation" />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this department owns..." />
          <p className="caption inline-flex items-center gap-1.5"><Network size={13} /> Code is generated from the name automatically.</p>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={saving} className="w-full"><Plus size={15} /> Create Department</Button>
        </form>
      </Modal>
    </>
  );
}
