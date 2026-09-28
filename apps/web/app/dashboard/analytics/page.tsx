'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Loader2, AlertTriangle, Eye, MousePointerClick, Users, FileCheck } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { createClient } from '@/lib/supabase';

type Summary = { kpis: { page_views: number; project_views: number; leads: number; quotes_completed: number }; daily_views: { timestamp: string }[] };

export default function AnalyticsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/analytics/summary?timeRange=30d`, {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
        });
        if (!res.ok) throw new Error('fetch failed');
        const json = await res.json();
        setData(json.data);
        setState('ready');
      } catch {
        setState('error');
      }
    }
    load();
  }, []);

  const series = (() => {
    if (!data) return [];
    const byDay = new Map<string, number>();
    for (const e of data.daily_views) {
      const day = new Date(e.timestamp).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    return Array.from(byDay.entries()).map(([day, views]) => ({ day: day.slice(5), views })).slice(-30);
  })();

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><BarChart3 size={22} className="text-primary" /> Analytics</h1>
      {state === 'loading' && <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={15} className="animate-spin" /> Loading analytics...</p></Card>}
      {state === 'error' && <Card><p className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={15} /> Analytics requires a signed-in staff account and a running API.</p></Card>}
      {state === 'ready' && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: Eye, label: 'Page views', value: data.kpis.page_views },
              { icon: MousePointerClick, label: 'Project views', value: data.kpis.project_views },
              { icon: Users, label: 'Leads', value: data.kpis.leads },
              { icon: FileCheck, label: 'Quotes completed', value: data.kpis.quotes_completed }
            ].map((k) => (
              <Card key={k.label}>
                <k.icon size={18} className="text-primary" aria-hidden />
                <CardTitle className="mt-2 text-sm font-medium">{k.label}</CardTitle>
                <CardDescription><span className="text-2xl font-bold text-text-primary">{k.value}</span></CardDescription>
              </Card>
            ))}
          </div>
          <Card>
            <CardTitle>Visitors over time</CardTitle>
            <CardDescription>Computed from analytics_events — respects light/dark theme.</CardDescription>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
                  <Line type="monotone" dataKey="views" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
