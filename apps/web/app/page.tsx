import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Code2, Palette, TrendingUp, Check, Star, Globe, Zap, Shield } from 'lucide-react';
import { SectionHeading } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Jasiri Web Studios — We Build Digital Products That Grow Businesses',
  description: 'Custom websites, web applications, SaaS platforms, and software systems. Design, engineering, and growth under one roof.'
};

const services = [
  { icon: Code2, title: 'Web Applications', desc: 'React, Next.js, Node.js, and PostgreSQL. Scalable apps with clean APIs, auth, and dashboards.' },
  { icon: Globe, title: 'Business Websites', desc: 'Fast, SEO-friendly marketing sites that convert visitors into qualified leads.' },
  { icon: Palette, title: 'Brand & Product Design', desc: 'Identity, UI/UX, and design systems that communicate trust and quality.' },
  { icon: TrendingUp, title: 'E-commerce', desc: 'Storefronts with payments, inventory, and analytics built for growth.' },
  { icon: Zap, title: 'SaaS Platforms', desc: 'Multi-tenant foundations: billing, roles, analytics, and client portals.' },
  { icon: Shield, title: 'Care & Maintenance', desc: 'Monitoring, updates, backups, and continuous improvement plans.' }
];

const projects = [
  { title: 'E-Commerce Platform', stack: 'Next.js · Node.js · PostgreSQL', result: '+38% conversion after relaunch' },
  { title: 'Corporate Website', stack: 'Next.js · Tailwind CSS', result: '1.2s LCP, 98 Lighthouse SEO' },
  { title: 'SaaS Analytics Dashboard', stack: 'React · Recharts · Supabase', result: 'Real-time KPIs for 2k daily users' }
];

const process = [
  { step: '01', title: 'Discover', desc: 'Goals, users, scope, and success metrics. Fixed quote, no surprises.' },
  { step: '02', title: 'Design', desc: 'Wireframes to polished UI. You review interactive prototypes.' },
  { step: '03', title: 'Build', desc: 'Weekly demos, staging links, automated tests, and code reviews.' },
  { step: '04', title: 'Launch & Grow', desc: 'SEO, analytics, training, and a care plan that keeps improving.' }
];

export default function Home() {
  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge tone="primary">Technology studio · Nairobi / Remote</Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              We build digital experiences that transform businesses
            </h1>
            <p className="mt-4 max-w-lg text-lg text-text-secondary">
              Custom websites, web applications, and software systems — designed, engineered, and maintained by one senior team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quote" className="btn-primary">Start a Project <ArrowRight size={16} /></Link>
              <Link href="/projects" className="btn-secondary">View Our Work</Link>
            </div>
            <dl className="mt-8 flex flex-wrap gap-6 text-sm">
              <div><dt className="caption">Projects shipped</dt><dd className="text-xl font-bold text-text-primary">40+</dd></div>
              <div><dt className="caption">Avg. Lighthouse</dt><dd className="text-xl font-bold text-text-primary">95+</dd></div>
              <div><dt className="caption">Support response</dt><dd className="text-xl font-bold text-text-primary">&lt; 24h</dd></div>
            </dl>
          </div>
          <Card className="bg-surface-muted">
            <p className="caption">HOW WE WORK</p>
            <ul className="mt-3 space-y-3 text-sm text-text-primary">
              {['Fixed quote before we start', 'Weekly staging demos', 'Real analytics, not vanity metrics', 'You own the code and data'].map((t) => (
                <li key={t} className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-success" />{t}</li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
              <Star size={16} className="text-warning" /> Trusted by startups, SMEs, and enterprises.
            </div>
          </Card>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Services" title="Everything you need to launch and scale" description="One team for strategy, design, engineering, and growth." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.title}>
              <s.icon size={22} className="text-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold text-text-primary">{s.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="container-page py-16">
          <SectionHeading eyebrow="Selected work" title="Results, not just screenshots" description="Every project ships with analytics, SEO, and a handover you can actually use." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.title}>
                <p className="caption">{p.stack}</p>
                <h3 className="mt-2 text-lg font-semibold text-text-primary">{p.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-success"><Check size={14} />{p.result}</p>
                <Link href="/projects" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">Open case study <ArrowRight size={14} /></Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Process" title="Predictable delivery in four steps" />
        <ol className="mt-10 grid gap-5 md:grid-cols-4">
          {process.map((p) => (
            <li key={p.step} className="card p-5">
              <p className="text-xs font-bold text-primary">{p.step}</p>
              <h3 className="mt-1 font-semibold text-text-primary">{p.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{p.desc}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/quote" className="btn-primary">Request a Quote <ArrowRight size={16} /></Link>
          <Link href="/contact" className="btn-secondary">Talk to Us</Link>
        </div>
      </section>
    </div>
  );
}
