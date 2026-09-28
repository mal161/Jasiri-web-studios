'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function MilestoneForm({ projectId, onCreated }: { projectId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/api/v1/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ project_id: projectId, title, due_date: dueDate || null })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Create failed — manager role required');
      }
      setTitle('');
      setDueDate('');
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}><Plus size={14} /> New Milestone</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create milestone">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Beta launch" />
          <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={saving} className="w-full"><Plus size={15} /> Create Milestone</Button>
        </form>
      </Modal>
    </>
  );
}
