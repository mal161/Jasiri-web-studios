'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Item = { description: string; quantity: number; unit_price: number };
type Project = { id: number; title: string };

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export function InvoiceForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unit_price: 0 }]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNumber(`INV-${Date.now().toString(36).toUpperCase()}`);
    (async () => {
      const res = await fetch(`${API}/api/v1/projects?admin=true&limit=100`, { headers: await authHeaders() });
      if (res.ok) setProjects((await res.json()).data ?? []);
    })();
  }, [open ]);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const total = subtotal + Number(tax || 0) - Number(discount || 0);

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
      const res = await fetch(`${API}/api/v1/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({
          invoice_number: number,
          project_id: projectId ? Number(projectId) : undefined,
          due_date: dueDate || undefined,
          currency,
          subtotal,
          tax: Number(tax || 0),
          discount: Number(discount || 0),
          total,
          items: items.map((i) => ({ description: i.description, quantity: Number(i.quantity), unit_price: Number(i.unit_price), total_price: i.quantity * i.unit_price }))
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Create failed — finance role required');
      setOpen(false);
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
      <Button type="button" size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Invoice</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create invoice">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Invoice number" value={number} onChange={(e) => setNumber(e.target.value)} required />
            <div>
              <label htmlFor="inv-project" className="label">Project (optional)</label>
              <select id="inv-project" className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">No project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <div>
              <label htmlFor="inv-currency" className="label">Currency</label>
              <select id="inv-currency" className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
            </div>
            <Input label="Tax" type="number" min="0" step="0.01" value={tax} onChange={(e) => setTax(Number(e.target.value))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Discount" type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
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
            <span className="inline-flex items-center gap-1.5"><ReceiptText size={15} className="text-primary" /> Total</span>
            <span>{currency} {total.toLocaleString()}</span>
          </p>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={saving} className="w-full"><Plus size={15} /> Create Invoice</Button>
        </form>
      </Modal>
    </>
  );
}
