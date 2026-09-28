'use client';

import { useState } from 'react';
import { Plus, Trash2, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Item = { description: string; quantity: number; unit_price: number };

export function QuoteForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState(() => `Q-${Date.now().toString(36).toUpperCase()}`);
  const [leadId, setLeadId] = useState('');
  const [expiry, setExpiry] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unit_price: 0 }]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);

  function setItem(idx: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.some((i) => !i.description.trim())) {
      setError('Every line item needs a description.');
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/api/v1/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          quote_number: number,
          lead_id: leadId ? Number(leadId) : undefined,
          expiry_date: expiry || undefined,
          notes: notes || undefined,
          items: items.map((i) => ({ description: i.description, quantity: Number(i.quantity), unit_price: Number(i.unit_price), total_price: i.quantity * i.unit_price }))
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Create failed — staff role required');
      setOpen(false);
      setNumber(`Q-${Date.now().toString(36).toUpperCase()}`);
      setItems([{ description: '', quantity: 1, unit_price: 0 }]);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Quote</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create quote">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Quote number" value={number} onChange={(e) => setNumber(e.target.value)} required />
            <Input label="Lead ID (optional)" type="number" min="1" value={leadId} onChange={(e) => setLeadId(e.target.value)} placeholder="CRM lead #" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Expiry date" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Valid 30 days..." />
          </div>
          <div>
            <p className="label">Line items</p>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_64px_96px_32px] items-center gap-2">
                  <input value={it.description} onChange={(e) => setItem(idx, { description: e.target.value })} placeholder="Description" aria-label={`Item ${idx + 1} description`} className="input" />
                  <input type="number" min="1" value={it.quantity} onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })} aria-label={`Item ${idx + 1} quantity`} className="input" />
                  <input type="number" min="0" step="0.01" value={it.unit_price} onChange={(e) => setItem(idx, { unit_price: Number(e.target.value) })} aria-label={`Item ${idx + 1} unit price`} className="input" />
                  <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))} disabled={items.length === 1} className="btn-secondary px-2 py-2 disabled:opacity-40" aria-label={`Remove item ${idx + 1}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={() => setItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0 }])}>
              <Plus size={13} /> Add Line
            </Button>
          </div>
          <p className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-text-primary">
            <span className="inline-flex items-center gap-1.5"><FileSignature size={15} className="text-primary" /> Total</span>
            <span>${total.toLocaleString()}</span>
          </p>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={saving} className="w-full"><Plus size={15} /> Create Quote</Button>
        </form>
      </Modal>
    </>
  );
}
