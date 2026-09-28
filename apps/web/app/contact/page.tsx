import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { SectionHeading } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Contact', description: 'Tell us about your project. We reply within one business day.' };

export default function ContactPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading eyebrow="Contact" title="Let's build something great" description="Send a message — it becomes a lead in our CRM with assignment and follow-up." />
      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <Card className="space-y-4 lg:col-span-2">
          <p className="flex items-center gap-2 text-sm text-text-primary"><Mail size={16} className="text-primary" /> hello@jasiri.studio</p>
          <p className="flex items-center gap-2 text-sm text-text-primary"><Phone size={16} className="text-primary" /> +254 700 000 000</p>
          <p className="flex items-center gap-2 text-sm text-text-primary"><MapPin size={16} className="text-primary" /> Nairobi, Kenya · Remote worldwide</p>
          <p className="caption">Prefer email? Include goals, timeline, and budget range for the fastest quote.</p>
        </Card>
        <form className="card space-y-4 p-6 lg:col-span-3" action="/api/leads" method="post">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" name="name" placeholder="Jane Muthoni" required autoComplete="name" />
            <Input label="Email" name="email" type="email" placeholder="jane@company.com" required autoComplete="email" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Company (optional)" name="company" placeholder="Company Ltd" autoComplete="organization" />
            <Input label="Phone (optional)" name="phone" placeholder="+254..." autoComplete="tel" />
          </div>
          <div>
            <label htmlFor="message" className="label">Project details</label>
            <textarea id="message" name="message" rows={5} required placeholder="Goals, timeline, must-have features..." className="input min-h-[120px]" />
          </div>
          <Button type="submit"><Send size={15} /> Send Message</Button>
          <p className="caption">Submitting creates a CRM lead (POST /api/v1/leads). No spam, ever.</p>
        </form>
      </div>
    </div>
  );
}
