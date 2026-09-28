import { cn } from '@/lib/utils';

const tones: Record<string, string> = {
  default: 'bg-surface-muted text-text-primary',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info'
};

export function Badge({ tone = 'default', className, children }: { tone?: keyof typeof tones | string; className?: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone] ?? tones.default, className)}>{children}</span>;
}
