'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, UserRound, StickyNote, Save, Send, Building2, Mail, Phone } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase';

type Note = { id: string | number; message: string; created_at: string; author?: { full_name: string } | null };
type Lead = {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  status: string;
  priority: string;
  source?: string | null;
  service_interest?: string | null;
  budget?: string | null;
  notes?: string | null;
  assigned_to?: string | null;
  created_at: string;
  notes_list?: Note[];
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONVERTED', 'LOST'];

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [status, setStatus] = useState('');
  const [assignee, setAssignee] = useState('');
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`${API}/api/v1/leads/${params.id}`, { headers: await authHeaders() });
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setLead(json.data);
      setStatus(json.data.status);
      setAssignee(json.data.assigned_to ?? '');
      setNotes(json.data.notes_list ?? json.data.notes ?? []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/v1/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ status, assigned_to: assignee || null })
      });
      if (!res.ok) throw new Error('Save failed');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      const res = await fetch(`${API}/api/v1/leads/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ message: noteText })
      });
      if (!res.ok) throw new Error('Note failed');
      setNoteText('');
      load();
    } finally {
      setNoteSaving(false);
    }
  }

  if (state === 'loading') return <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading lead...</p></Card>;
  if (state === 'error' || !lead) return <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Lead not found or access denied.</p></Card>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/leads" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"><ArrowLeft size={14} /> All leads</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><UserRound size={22} className="text-primary" /> {lead.name}</h1>
          <Badge tone={lead.status === 'CONVERTED' ? 'success' : lead.status === 'LOST' ? 'danger' : lead.status === 'NEW' ? 'info' : 'default'}>{lead.status.replace('_', ' ')}</Badge>
          <Badge tone="default">{lead.priority}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1.5"><Mail size={14} />{lead.email}</span>
          {lead.phone && <span className="inline-flex items-center gap-1.5"><Phone size={14} />{lead.phone}</span>}
          {lead.company && <span className="inline-flex items-center gap-1.5"><Building2 size={14} />{lead.company}</span>}
        </div>
        {(lead.service_interest || lead.budget || lead.source) && (
          <p className="caption mt-2">Interest: {lead.service_interest ?? '—'} · Budget: {lead.budget ?? '—'} · Source: {lead.source ?? '—'}</p>
        )}
        {lead.notes && typeof lead.notes === 'string' && <p className="mt-2 text-sm text-text-secondary">{lead.notes}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="text-sm">Pipeline & assignment</CardTitle>
          <div className="mt-3 space-y-4">
            <div>
              <label htmlFor="lead-status" className="label">Status</label>
              <select id="lead-status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <Input label="Assigned to (user UUID)" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Leave empty to unassign" hint="Paste the staff member's profile UUID." />
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <Button onClick={save} loading={saving}><Save size={15} /> Save Changes</Button>
          </div>
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-2 text-sm"><StickyNote size={15} className="text-primary" /> Follow-up notes ({notes.length})</CardTitle>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {notes.map((n) => (
              <li key={String(n.id)} className="rounded-md bg-surface-muted p-3 text-sm">
                <p className="text-text-primary">{n.message}</p>
                <p className="caption mt-1">{n.author?.full_name ?? ''} · {new Date(n.created_at).toLocaleString()}</p>
              </li>
            ))}
            {notes.length === 0 && <li className="caption">No notes yet. Log every call and follow-up here.</li>}
          </ul>
          <form onSubmit={addNote} className="mt-3 flex gap-2">
            <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a follow-up note..." className="input" aria-label="Add a follow-up note" />
            <Button type="submit" loading={noteSaving}><Send size={14} /></Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
