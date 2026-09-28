'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, AlertTriangle, Inbox, ArrowLeft, ArrowRight, Flag, CalendarDays } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'COMPLETED';
export type Task = {
  id: string | number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string | null;
  project_id?: string | number | null;
  project?: { title: string; slug: string } | null;
};

const COLUMNS: { id: TaskStatus; label: string; tone: string }[] = [
  { id: 'TODO', label: 'To Do', tone: 'default' },
  { id: 'IN_PROGRESS', label: 'In Progress', tone: 'info' },
  { id: 'IN_REVIEW', label: 'In Review', tone: 'warning' },
  { id: 'BLOCKED', label: 'Blocked', tone: 'danger' },
  { id: 'COMPLETED', label: 'Completed', tone: 'success' }
];

const priorityTone: Record<string, string> = { LOW: 'default', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger' };

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export function KanbanBoard({ mine, projectId }: { mine?: boolean; projectId?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [moving, setMoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const params = new URLSearchParams();
      if (mine) params.set('mine', 'true');
      if (projectId) params.set('project_id', projectId);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/tasks?${params.toString()}`,
        { headers: await authHeaders() }
      );
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setTasks(json.data ?? []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [mine, projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function move(task: Task, dir: -1 | 1) {
    const idx = COLUMNS.findIndex((c) => c.id === task.status);
    const next = COLUMNS[idx + dir];
    if (!next) return;
    setMoving(String(task.id));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ status: next.id })
      });
      if (!res.ok) throw new Error('move failed');
      setTasks((prev) => prev.map((t) => (String(t.id) === String(task.id) ? { ...t, status: next.id } : t)));
    } catch {
      // keep card in place; surface via reload
      load();
    } finally {
      setMoving(null);
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    for (const c of COLUMNS) map.set(c.id, []);
    for (const t of tasks) map.get(t.status)?.push(t);
    return map;
  }, [tasks]);

  if (state === 'loading') {
    return <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading tasks...</p></Card>;
  }
  if (state === 'error') {
    return <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Could not load tasks. Sign in and ensure the API is running.</p></Card>;
  }
  if (tasks.length === 0) {
    return (
      <Card>
        <p className="flex items-center gap-2 text-sm font-medium text-text-primary"><Inbox size={16} className="text-text-secondary" /> No tasks here</p>
        <p className="mt-1 text-sm text-text-secondary">Tasks assigned to you or this project will appear on this board.</p>
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-3 xl:grid-cols-5">
      {COLUMNS.map((col) => (
        <section key={col.id} aria-label={col.label} className="rounded-lg border border-border bg-surface-muted/50 p-2">
          <header className="flex items-center justify-between px-2 py-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{col.label}</h3>
            <Badge tone={col.tone}>{grouped.get(col.id)?.length ?? 0}</Badge>
          </header>
          <div className="space-y-2">
            {(grouped.get(col.id) ?? []).map((t) => (
              <article key={String(t.id)} className="card p-3">
                <p className="text-sm font-medium text-text-primary">{t.title}</p>
                {t.project?.title && <p className="caption mt-0.5">{t.project.title}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge tone={priorityTone[t.priority] ?? 'default'}>
                    <span className="inline-flex items-center gap-1"><Flag size={11} />{t.priority}</span>
                  </Badge>
                  {t.due_date && <span className="caption inline-flex items-center gap-1"><CalendarDays size={11} />{new Date(t.due_date).toLocaleDateString()}</span>}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => move(t, -1)}
                    disabled={moving === String(t.id) || col.id === 'TODO'}
                    className="btn-secondary px-2 py-1 text-xs disabled:opacity-40"
                    aria-label={`Move ${t.title} back to previous column`}
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <span className="caption">{moving === String(t.id) ? 'Moving...' : col.label}</span>
                  <button
                    type="button"
                    onClick={() => move(t, 1)}
                    disabled={moving === String(t.id) || col.id === 'COMPLETED'}
                    className="btn-secondary px-2 py-1 text-xs disabled:opacity-40"
                    aria-label={`Move ${t.title} forward to next column`}
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
