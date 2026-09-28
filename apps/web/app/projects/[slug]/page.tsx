import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return { title: `${params.slug.replace(/-/g, ' ')} — Case Study` };
}

export default function ProjectDetail({ params }: { params: { slug: string } }) {
  const title = params.slug.replace(/-/g, ' ');
  return (
    <div className="container-page py-12">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"><ArrowLeft size={14} /> All projects</Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold capitalize text-text-primary">{title}</h1>
        <Badge tone="success">LIVE</Badge>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold text-text-primary"><CheckCircle2 size={16} className="text-success" /> Overview</h2>
          <p className="mt-2 text-sm text-text-secondary">Problem → objectives → research → solution → architecture → results. This page is wired to the projects API; content below shows the case-study structure every project follows.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[['Problem', 'Slow legacy site, no analytics'], ['Solution', 'Next.js + Supabase rebuild'], ['Results', '+38% conversion, 1.2s LCP']].map(([h, b]) => (
              <div key={h} className="rounded-md bg-surface-muted p-3"><p className="text-xs font-semibold text-text-primary">{h}</p><p className="mt-1 text-xs text-text-secondary">{b}</p></div>
            ))}
          </div>
        </Card>
        <div className="space-y-5">
          <Card>
            <h2 className="flex items-center gap-2 font-semibold text-text-primary"><Cpu size={16} className="text-primary" /> Stack</h2>
            <p className="caption mt-2">Next.js · Tailwind · Supabase · Recharts</p>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 font-semibold text-text-primary"><AlertTriangle size={16} className="text-warning" /> Links</h2>
            <p className="mt-2 flex flex-col gap-2 text-sm">
              <span className="inline-flex items-center gap-1 text-primary">Live demo <ArrowUpRight size={14} /></span>
              <span className="inline-flex items-center gap-1 text-primary">Repository <ArrowUpRight size={14} /></span>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
