import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, ArrowRight, HeartHandshake, GraduationCap, Clock } from 'lucide-react';
import { SectionHeading } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = { title: 'Careers', description: 'Join Jasiri Web Studios. Roles, values, and how to apply.' };

const roles = [
  { title: 'Frontend Engineer (Next.js)', type: 'Contract · Remote', desc: 'App Router, Tailwind design tokens, accessible UI.' },
  { title: 'Backend Engineer (Node + Supabase)', type: 'Contract · Remote', desc: 'RLS, REST APIs, Zod validation, audit logs.' },
  { title: 'Product Designer', type: 'Contract · Remote', desc: 'Design systems, prototypes, dark-mode-ready UI.' }
];

const perks = [
  { icon: Clock, title: 'Flexible hours', desc: 'Async-first with weekly demos.' },
  { icon: GraduationCap, title: 'Learning budget', desc: 'Courses, books, and conferences.' },
  { icon: HeartHandshake, title: 'Real ownership', desc: 'You ship to production in week one.' }
];

export default function CareersPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading eyebrow="Careers" title="Build the studio with us" description="Small senior team, real products, no bureaucracy." />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {roles.map((r) => (
          <Card key={r.title}>
            <p className="flex items-center gap-2 text-sm text-primary"><Briefcase size={15} />{r.type}</p>
            <h2 className="mt-2 font-semibold text-text-primary">{r.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{r.desc}</p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">Apply <ArrowRight size={14} /></Link>
          </Card>
        ))}
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {perks.map((p) => (
          <Card key={p.title}>
            <p.icon size={18} className="text-primary" aria-hidden />
            <h3 className="mt-2 font-semibold text-text-primary">{p.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{p.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
