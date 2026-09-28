'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/projects', label: 'Work' },
  { href: '/blog', label: 'Blog' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' }
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Jasiri home">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">J</span>
          <span className="text-base font-semibold text-text-primary">Jasiri Web Studios</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/quote" className="btn-primary">Request a Quote</Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button className="btn-secondary px-3 py-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-surface px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-text-primary hover:bg-surface-muted">
                {l.label}
              </Link>
            ))}
            <Link href="/quote" onClick={() => setOpen(false)} className="btn-primary mt-2">Request a Quote</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
