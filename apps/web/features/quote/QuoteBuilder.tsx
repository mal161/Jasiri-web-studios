'use client';

import { useMemo, useState } from 'react';
import { Calculator, Check, Loader2, Send, Building2, ShoppingCart, LayoutDashboard, Globe, Wrench, Boxes } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const PROJECT_TYPES = [
  { id: 'website', label: 'Business Website', base: 1200, icon: Globe },
  { id: 'ecommerce', label: 'E-commerce', base: 3500, icon: ShoppingCart },
  { id: 'webapp', label: 'Web Application', base: 6000, icon: LayoutDashboard },
  { id: 'saas', label: 'SaaS Platform', base: 12000, icon: Boxes },
  { id: 'landing', label: 'Landing Page', base: 600, icon: Building2 },
  { id: 'maintenance', label: 'Care Plan', base: 300, icon: Wrench }
];

const FEATURES = [
  { id: 'auth', label: 'Authentication + roles', price: 800 },
  { id: 'payments', label: 'Payments', price: 1200 },
  { id: 'dashboard', label: 'Admin dashboard', price: 1500 },
  { id: 'cms', label: 'Blog / CMS', price: 700 },
  { id: 'api', label: 'API integrations', price: 900 },
  { id: 'analytics', label: 'Analytics + SEO', price: 500 },
  { id: 'search', label: 'Search + filters', price: 600 },
  { id: 'notifications', label: 'Email notifications', price: 400 },
  { id: 'ai', label: 'AI features', price: 2500 }
];

export function QuoteBuilder() {
  const [projectType, setProjectType] = useState('website');
  const [selected, setSelected] = useState<string[]>(['cms', 'analytics']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const total = useMemo(() => {
    const base = PROJECT_TYPES.find((t) => t.id === projectType)?.base ?? 0;
    const feats = FEATURES.filter((f) => selected.includes(f.id)).reduce((s, f) => s + f.price, 0);
    return base + feats;
  }, [projectType, selected]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          service_interest: projectType,
          budget: `$${total.toLocaleString()}`,
          message: `${message}\n\nEstimate: $${total.toLocaleString()} (${projectType}; features: ${selected.join(', ')})`,
          source: 'WEBSITE'
        })
      });
      if (!res.ok) throw new Error('submit failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-text-primary"><Calculator size={24} className="text-primary" /> Request a Quote</h1>
          <p className="mt-2 text-sm text-text-secondary">Pricing rules live in the database (pricing_rules); this UI reads the same rule shape. Submitting creates a CRM lead.</p>
        </div>
        <Card>
          <h2 className="font-semibold text-text-primary">1. Project type</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Project type">
            {PROJECT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={projectType === t.id}
                onClick={() => setProjectType(t.id)}
                className={`flex items-center gap-3 rounded-md border p-3 text-left transition-colors ${projectType === t.id ? 'border-primary bg-primary-soft/20' : 'border-border hover:bg-surface-muted'}`}
              >
                <t.icon size={18} className="shrink-0 text-primary" aria-hidden />
                <span><span className="block text-sm font-medium text-text-primary">{t.label}</span><span className="caption">from ${t.base.toLocaleString()}</span></span>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-text-primary">2. Features</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const on = selected.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(f.id)}
                  className={`flex items-center justify-between rounded-md border p-3 text-left ${on ? 'border-primary bg-primary-soft/20' : 'border-border hover:bg-surface-muted'}`}
                >
                  <span className="flex items-center gap-2 text-sm text-text-primary">
                    <span className={`flex h-5 w-5 items-center justify-center rounded border ${on ? 'border-primary bg-primary text-white' : 'border-border'}`}>{on && <Check size={13} />}</span>
                    {f.label}
                  </span>
                  <span className="caption">+${f.price.toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-text-primary">3. Your details</h2>
          <form onSubmit={submit} className="mt-3 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Muthoni" autoComplete="name" />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane@company.com" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="quote-message" className="label">Anything else?</label>
              <textarea id="quote-message" className="input min-h-[100px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Timeline, references, must-haves..." />
            </div>
            <Button type="submit" loading={status === 'sending'}><Send size={15} /> Submit Request</Button>
            {status === 'sent' && <p className="flex items-center gap-1.5 text-sm text-success"><Check size={14} /> Received — we reply within one business day.</p>}
            {status === 'error' && <p className="text-sm text-danger">Could not submit. Is the API running on port 4000?</p>}
          </form>
        </Card>
      </div>
      <aside className="lg:col-span-2">
        <Card className="sticky top-24">
          <p className="caption">ESTIMATED RANGE</p>
          <p className="mt-1 text-3xl font-bold text-text-primary">${total.toLocaleString()}</p>
          <p className="caption mt-1">Indicative only — fixed quote follows a discovery call.</p>
          <div className="mt-4 space-y-1.5 text-sm">
            <p className="flex justify-between text-text-secondary"><span>Base ({PROJECT_TYPES.find((t) => t.id === projectType)?.label})</span><span className="text-text-primary">${(PROJECT_TYPES.find((t) => t.id === projectType)?.base ?? 0).toLocaleString()}</span></p>
            {FEATURES.filter((f) => selected.includes(f.id)).map((f) => (
              <p key={f.id} className="flex justify-between text-text-secondary"><span>{f.label}</span><span className="text-text-primary">+${f.price.toLocaleString()}</span></p>
            ))}
          </div>
          <div className="mt-4"><Badge tone="primary">{selected.length} features selected</Badge></div>
        </Card>
      </aside>
    </div>
  );
}
