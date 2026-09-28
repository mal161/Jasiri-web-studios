export function SectionHeading({ eyebrow, title, description, align = 'center' }: { eyebrow?: string; title: string; description?: string; align?: 'left' | 'center' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">{title}</h2>
      {description && <p className="mt-3 text-base text-text-secondary">{description}</p>}
    </div>
  );
}
