import type { Metadata } from 'next';
import { KanbanSquare } from 'lucide-react';
import { KanbanBoard } from '@/features/tasks/KanbanBoard';

export const metadata: Metadata = { title: 'My Tasks' };

export default function MyTasksPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><KanbanSquare size={22} className="text-primary" /> My Tasks</h1>
        <p className="mt-1 text-sm text-text-secondary">Assigned work across all projects. Move cards with the arrow buttons — every move hits the tasks API and writes an audit log.</p>
      </div>
      <KanbanBoard mine />
    </div>
  );
}
