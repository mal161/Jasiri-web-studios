import { cn } from '@/lib/utils';

export function Table({ className, children }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className={cn('w-full min-w-[640px] border-collapse bg-surface text-left text-sm', className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-surface-muted text-xs uppercase text-text-secondary">{children}</thead>;
}

export function TRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-t border-border first:border-t-0 hover:bg-surface-muted/50">{children}</tr>;
}

export function TH({ children }: { children: React.ReactNode }) {
  return <th scope="col" className="px-4 py-3 font-medium">{children}</th>;
}

export function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-text-primary', className)}>{children}</td>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
