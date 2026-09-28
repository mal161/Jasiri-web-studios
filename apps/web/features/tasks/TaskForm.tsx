'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function TaskForm({ projectId, onCreated }: { projectId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
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
      const res = await fetch(`${API}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          title,
          description: description || null,
          project_id: projectId,
          priority,
          due_date: dueDate || null
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Create failed — manager role required');
      }
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
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
      <Button type="button" size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Task</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create task">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Implement checkout flow" />
          <div>
            <label htmlFor="task-desc" className="label">Description</label>
            <textarea id="task-desc" className="input min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Acceptance criteria..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-priority" className="label">Priority</label>
              <select id="task-priority" className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={saving} className="w-full">{saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Create Task</Button>
        </form>
      </Modal>
    </>
  );
}
