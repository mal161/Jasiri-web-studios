import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Filter } from 'lucide-react';
import { SectionHeading } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Work', description: 'Selected projects and case studies from Jasiri Web Studios.' };

const projects = [
  { slug: 'ecommerce-platform', title: 'E-Commerce Platform', category: 'E-commerce', stack: ['Next.js', 'Node.js', 'PostgreSQL'], result: '+38% conversion', status: 'LIVE' as const },
  { slug: 'corporate-website', title: 'Corporate Website', category: 'Marketing Site', stack: ['Next.js', 'Tailwind'], result: '98 SEO score', status: 'LIVE' as const },
  { slug: 'saas-dashboard', title: 'SaaS Analytics Dashboard', category: 'SaaS', stack: ['React', 'Recharts', 'Supabase'], result: '2k daily users', status: 'IN_PROGRESS' as const }
];

export default function ProjectsPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading eyebrow="Portfolio" title="Selected work" description="Database-driven case studies. Filter by category or technology on the live platform." />
      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary"><Filter size={14} /> Categories: Web Apps · E-commerce · SaaS · Marketing Sites</p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.slug} className="flex flex-col">
            <div className="flex items-center justify-between">
              <Badge tone={p.status === 'LIVE' ? 'success' : 'info'}>{p.status.replace('_', ' ')}</Badge>
              <span className="caption">{p.category}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-text-primary">{p.title}</h2>
            <p className="caption mt-1">{p.stack.join(' · ')}</p>
            <p className="mt-2 text-sm font-medium text-success">{p.result}</p>
            <Link href={`/projects/${p.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
              Open case study <ArrowRight size={14} />
            </Link>
          </Card>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-text-secondary">
        Full case-study pages with architecture, challenges, and metrics live at <span className="inline-flex items-center gap-1 font-medium text-text-primary">/projects/[slug] <ArrowUpRight size={14} /></span>
      </p>
    </div>
  );
}
