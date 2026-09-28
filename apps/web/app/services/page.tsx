import type { Metadata } from 'next';
import Link from 'next/link';
import { Code2, ShoppingCart, LayoutDashboard, Globe, Palette, Wrench, ArrowRight, Check } from 'lucide-react';
import { SectionHeading } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = { title: 'Services', description: 'Web development, e-commerce, SaaS, design, and maintenance services.' };

const services = [
  { icon: Globe, title: 'Business Websites', desc: 'Marketing sites that rank and convert.', points: ['Next.js + Tailwind', 'Technical SEO + sitemap', 'Analytics + lead capture'] },
  { icon: ShoppingCart, title: 'E-commerce', desc: 'Storefronts with payments and inventory.', points: ['Checkout + M-Pesa/cards roadmap', 'Product CMS', 'Order analytics'] },
  { icon: Code2, title: 'Web Applications', desc: 'Dashboards, portals, and internal tools.', points: ['Auth + RBAC', 'Supabase/PostgreSQL', 'Testing + docs'] },
  { icon: LayoutDashboard, title: 'SaaS Platforms', desc: 'Multi-tenant foundations for growth.', points: ['Billing-ready architecture', 'Roles + audit logs', 'Client portal patterns'] },
  { icon: Palette, title: 'Brand & Product Design', desc: 'Identity and UI that earn trust.', points: ['Logo + guidelines', 'UI/UX + prototypes', 'Design tokens + dark mode'] },
  { icon: Wrench, title: 'Care & Maintenance', desc: 'Keep shipping after launch.', points: ['Monitoring + backups', 'Security updates', 'Monthly improvements'] }
];

export default function ServicesPage() {
  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-16">
          <SectionHeading align="left" eyebrow="Services" title="What we build" description="Fixed-scope engagements with senior engineers. You always know what ships and when." />
        </div>
      </section>
      <section className="container-page py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.title}>
              <s.icon size={22} className="text-primary" aria-hidden />
              <h2 className="mt-3 text-lg font-semibold text-text-primary">{s.title}</h2>
              <p className="mt-1 text-sm text-text-secondary">{s.desc}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-text-primary">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-success" />{p}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/quote" className="btn-primary">Get a Fixed Quote <ArrowRight size={16} /></Link>
          <Link href="/contact" className="btn-secondary">Ask a Question</Link>
        </div>
      </section>
    </div>
  );
}
