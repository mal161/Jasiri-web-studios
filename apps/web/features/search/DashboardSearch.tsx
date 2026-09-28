'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function DashboardSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim().length >= 2) router.push(`/dashboard/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <form onSubmit={submit} role="search" className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
      <Search size={15} className="shrink-0 text-text-secondary" aria-hidden />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search projects, leads, tasks..."
        aria-label="Global search"
        className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
      />
    </form>
  );
}
