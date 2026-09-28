'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, Users, Milestone, Files, MessagesSquare, ListTodo } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { KanbanBoard } from '@/features/tasks/KanbanBoard';
import { TaskForm } from '@/features/tasks/TaskForm';
import { MilestoneForm } from '@/features/milestones/MilestoneForm';
import { createClient } from '@/lib/supabase';

type Member = { role: string; user: { full_name: string; email: string } };
type MilestoneT = { id: string | number; title: string; status: string; due_date?: string | null };
type FileT = { id: string | number; file_name: string; created_at: string };
type MessageT = { id: string | number; subject?: string | null; body: string; created_at: string };
type Project = {
  id: string | number;
  title: string;
  status: string;
  client?: string | null;
  members?: Member[];
  milestones?: MilestoneT[];
};

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileT[]>([]);
  const [messages, setMessages] = useState<MessageT[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [boardKey, setBoardKey] = useState(0);
  function refresh() {
    setBoardKey((k) => k + 1);
    load();
  }

  const load = useCallback(async () => {
    setState('loading');
    try {
      const headers = await authHeaders();
      const [pRes, fRes, mRes] = await Promise.all([
        fetch(`${API}/api/v1/projects/${params.id}`, { headers }),
        fetch(`${API}/api/v1/files?project_id=${params.id}`, { headers }),
        fetch(`${API}/api/v1/messages?project_id=${params.id}`, { headers })
      ]);
      if (!pRes.ok) throw new Error('project fetch failed');
      const pJson = await pRes.json();
      setProject(pJson.data);
      if (fRes.ok) setFiles((await fRes.json()).data ?? []);
      if (mRes.ok) setMessages((await mRes.json()).data ?? []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') {
    return <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading project...</p></Card>;
  }
  if (state === 'error' || !project) {
    return <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Could not load this project. Check your access and that the API is running.</p></Card>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"><ArrowLeft size={14} /> All projects</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">{project.title}</h1>
          <Badge tone={project.status === 'COMPLETED' || project.status === 'LIVE' ? 'success' : 'info'}>{project.status.replace('_', ' ')}</Badge>
          {project.client && <span className="caption">Client: {project.client}</span>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle className="flex items-center gap-2 text-sm"><Users size={15} className="text-primary" /> Team ({project.members?.length ?? 0})</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {(project.members ?? []).map((m, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span className="text-text-primary">{m.user.full_name}</span>
                <Badge tone="default">{m.role}</Badge>
              </li>
            ))}
            {(project.members ?? []).length === 0 && <li className="caption">No members assigned yet.</li>}
          </ul>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm"><Milestone size={15} className="text-primary" /> Milestones ({project.milestones?.length ?? 0})</CardTitle>
            <MilestoneForm projectId={params.id} onCreated={refresh} />
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {(project.milestones ?? []).map((m) => (
              <li key={String(m.id)} className="flex items-center justify-between gap-2">
                <span className="text-text-primary">{m.title}</span>
                <Badge tone={m.status === 'COMPLETED' ? 'success' : m.status === 'BLOCKED' ? 'danger' : 'info'}>{m.status.replace('_', ' ')}</Badge>
              </li>
            ))}
            {(project.milestones ?? []).length === 0 && <li className="caption">No milestones yet.</li>}
          </ul>
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-2 text-sm"><Files size={15} className="text-primary" /> Files ({files.length})</CardTitle>
          <CardDescription>Stored in Supabase Storage; metadata via the files API.</CardDescription>
          <ul className="mt-3 space-y-1.5 text-sm">
            {files.slice(0, 5).map((f) => (
              <li key={String(f.id)} className="text-text-primary">{f.file_name}</li>
            ))}
            {files.length === 0 && <li className="caption">No files uploaded yet.</li>}
          </ul>
        </Card>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary"><ListTodo size={17} className="text-primary" /> Task board</h2>
          <TaskForm projectId={params.id} onCreated={refresh} />
        </div>
        <div className="mt-3"><KanbanBoard key={boardKey} projectId={params.id} /></div>
      </div>

      <Card>
        <CardTitle className="flex items-center gap-2 text-sm"><MessagesSquare size={15} className="text-primary" /> Recent messages ({messages.length})</CardTitle>
        <ul className="mt-3 space-y-3">
          {messages.slice(0, 5).map((m) => (
            <li key={String(m.id)} className="rounded-md bg-surface-muted p-3 text-sm">
              {m.subject && <p className="font-medium text-text-primary">{m.subject}</p>}
              <p className="text-text-secondary">{m.body}</p>
            </li>
          ))}
          {messages.length === 0 && <li className="caption">No messages yet. Project communication lives here — not in a separate chat tool.</li>}
        </ul>
      </Card>
    </div>
  );
}
