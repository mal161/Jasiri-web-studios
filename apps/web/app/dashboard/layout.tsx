import Link from 'next/link';
import { LayoutDashboard, Users, FolderKanban, BarChart3, FileText, Settings, Wallet, Bell, KanbanSquare, Building2, Contact2, Network, FileSignature, ScrollText } from 'lucide-react';
import { DashboardSearch } from '@/features/search/DashboardSearch';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'CRM', icon: Users },
  { href: '/dashboard/quotes', label: 'Quotes', icon: FileSignature },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/tasks', label: 'My Tasks', icon: KanbanSquare },
  { href: '/dashboard/client', label: 'Client Portal', icon: Building2 },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/invoices', label: 'Finance', icon: Wallet },
  { href: '/dashboard/posts', label: 'Blog', icon: FileText },
  { href: '/dashboard/employees', label: 'Employees', icon: Contact2 },
  { href: '/dashboard/departments', label: 'Departments', icon: Network },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="card h-fit space-y-3 p-3 lg:sticky lg:top-24" aria-label="Dashboard navigation">
        <DashboardSearch />
        <p className="caption px-2 py-1">JASIRI COMMAND CENTER</p>
        <nav className="mt-1 flex flex-col gap-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary">
              <n.icon size={16} aria-hidden /> {n.label}
            </Link>
          ))}
        </nav>
        <p className="caption mt-3 px-2">Sidebar adapts per role (developer, finance, admin). Mobile collapses to stacked nav.</p>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
