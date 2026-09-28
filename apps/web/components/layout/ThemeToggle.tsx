'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="btn-secondary px-3 py-2"
      aria-label={`Switch theme (current: ${theme})`}
      title={`Theme: ${theme} — click for ${next}`}
    >
      <Icon size={16} />
      <span className="sr-only">{theme}</span>
    </button>
  );
}
