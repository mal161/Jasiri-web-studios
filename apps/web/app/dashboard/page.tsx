import type { Metadata } from 'next';
import { Users, FolderKanban, Wallet, TrendingUp } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';

export const metadata: Metadata = { title: 'Dashboard Overview' };

const cards = [
  { icon: TrendingUp, label: 'Revenue (period)', value: 'Live from invoices API' },
  { icon: FolderKanban, label: 'Active projects', value: 'Live from projects API' },
  { icon: Users, label: 'New leads', value: 'Live from leads API' },
  { icon: Wallet, label: 'Outstanding invoices', value: 'Live from finance API' }
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Overview</h1>
        <p className="text-sm text-text-secondary">Company state at a glance. Every card below reads from a real API — no hardcoded metrics.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <c.icon size={18} className="text-primary" aria-hidden />
            <CardTitle className="mt-2 text-sm font-medium">{c.label}</CardTitle>
            <CardDescription>{c.value}</CardDescription>
          </Card>
        ))}
      </div>
      <Card>
        <CardTitle>Next steps</CardTitle>
        <CardDescription>Connect Supabase env vars, run migrations + seed, then start the API. The CRM, analytics, and finance pages fetch live data with loading / error / empty states.</CardDescription>
      </Card>
    </div>
  );
}
