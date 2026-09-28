import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <p className="text-base font-semibold text-text-primary">Jasiri Web Studios</p>
          <p className="caption mt-2 max-w-xs">Technology studio designing and developing digital products, websites, and software systems.</p>
        </div>
        <nav aria-label="Company">
          <p className="text-sm font-medium text-text-primary">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><Link href="/about" className="hover:text-text-primary">About</Link></li>
            <li><Link href="/careers" className="hover:text-text-primary">Careers</Link></li>
            <li><Link href="/blog" className="hover:text-text-primary">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-text-primary">Contact</Link></li>
          </ul>
        </nav>
        <nav aria-label="Services">
          <p className="text-sm font-medium text-text-primary">Services</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><Link href="/services" className="hover:text-text-primary">Web Development</Link></li>
            <li><Link href="/services" className="hover:text-text-primary">E-commerce</Link></li>
            <li><Link href="/services" className="hover:text-text-primary">SaaS Platforms</Link></li>
            <li><Link href="/quote" className="hover:text-text-primary">Request a Quote</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-sm font-medium text-text-primary">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li>hello@jasiri.studio</li>
            <li>Nairobi, Kenya</li>
            <li><Link href="/contact" className="text-primary hover:text-primary-hover">Start a project →</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-4 text-xs text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Jasiri Web Studios. All rights reserved.</p>
          <p>Built with Next.js, Tailwind CSS, and Supabase.</p>
        </div>
      </div>
    </footer>
  );
}
