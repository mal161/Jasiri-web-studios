import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Tag } from 'lucide-react';
import { SectionHeading } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Blog', description: 'Engineering notes, tutorials, and studio updates.' };

const posts = [
  { slug: 'modern-saas-react-node', title: 'Building a Modern SaaS App with React and Node.js', category: 'Engineering', date: '2026-09-10', excerpt: 'Auth, RBAC, billing-ready architecture, and audit logs — without microservice sprawl.' },
  { slug: 'dark-mode-best-practices', title: 'Dark Mode Without the Headaches', category: 'Design', date: '2026-09-02', excerpt: 'Design tokens + Tailwind class strategy + persisted system preference.' },
  { slug: 'api-design-patterns', title: 'API Design Patterns for Scalable Systems', category: 'Engineering', date: '2026-08-24', excerpt: 'Consistent envelopes, Zod validation, RLS, and auditability.' }
];

export default function BlogPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading eyebrow="Blog" title="Notes from the studio" description="Practical engineering and design writing. CMS-driven on the live platform." />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {posts.map((p) => (
          <Card key={p.slug}>
            <div className="flex items-center gap-2"><Badge tone="primary"><span className="inline-flex items-center gap-1"><Tag size={12} />{p.category}</span></Badge><span className="caption inline-flex items-center gap-1"><CalendarDays size={12} />{p.date}</span></div>
            <h2 className="mt-3 font-semibold text-text-primary">{p.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{p.excerpt}</p>
            <Link href={`/blog/${p.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">Read article <ArrowRight size={14} /></Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
