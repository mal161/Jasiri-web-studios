import type { Metadata } from 'next';
import { Target, Eye, Heart, Users, Code2, Award } from 'lucide-react';
import { SectionHeading } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = { title: 'About', description: 'Who Jasiri Web Studios is, what we value, and the founder behind it.' };

const values = [
  { icon: Target, title: 'Precision', desc: 'Scoped work, fixed quotes, measurable outcomes. No vague retainers.' },
  { icon: Eye, title: 'Transparency', desc: 'Staging links, weekly demos, and plain-language progress updates.' },
  { icon: Heart, title: 'Partnership', desc: 'We succeed when your product grows. We design for that.' },
  { icon: Award, title: 'Craft', desc: 'Accessible, fast, tested code — reviewed and documented.' }
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">About Jasiri</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-text-primary">A technology studio, not a template shop</h1>
            <p className="mt-4 text-lg text-text-secondary">
              Jasiri Web Studios designs and develops digital products, websites, web applications, and software systems — and operates them on the Jasiri Platform itself.
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              The same system that runs our CRM, projects, analytics, and client portal is the foundation we use to deliver client work: real data, real workflows, no mockups.
            </p>
          </div>
          <Card className="bg-surface-muted">
            <p className="flex items-center gap-2 text-sm font-semibold text-text-primary"><Users size={16} className="text-primary" /> Founder profile</p>
            <h2 className="mt-2 text-xl font-bold text-text-primary">Alex Mwangi — Software Engineer</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Full-stack development, product engineering, and entrepreneurship. Focused on Next.js, Node.js, PostgreSQL/Supabase, and building maintainable systems that teams can own.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-text-secondary"><Code2 size={16} className="text-primary" /> Open to collaborations, freelance platforms, and product partnerships.</p>
          </Card>
        </div>
      </section>
      <section className="container-page py-16">
        <SectionHeading eyebrow="Values" title="How we work" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <Card key={v.title}>
              <v.icon size={20} className="text-primary" aria-hidden />
              <h3 className="mt-3 font-semibold text-text-primary">{v.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
