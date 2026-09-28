import type { Metadata } from 'next';
import Link from 'next/link';
import { FolderKanban, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = { title: 'Projects' };

export default function ProjectsDashboard() {
  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><FolderKanban size={22} className="text-primary" /> Projects</h1>
      <Card>
        <p className="text-sm text-text-secondary">Kanban (Todo / In Progress / In Review / Blocked / Completed), list view, milestones, and task detail live here — backed by /api/v1/projects and /api/v1/tasks. Public portfolio stays in sync automatically.</p>
        <Link href="/projects" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">View public portfolio <ArrowRight size={14} /></Link>
      </Card>
    </div>
  );
}
