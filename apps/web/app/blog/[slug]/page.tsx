import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return { title: params.slug.replace(/-/g, ' ') };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <article className="container-page max-w-3xl py-12">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"><ArrowLeft size={14} /> All posts</Link>
      <h1 className="mt-4 text-3xl font-bold capitalize text-text-primary">{params.slug.replace(/-/g, ' ')}</h1>
      <p className="caption mt-2 inline-flex items-center gap-1"><CalendarDays size={12} /> CMS-driven article with SEO title, description, and cover image.</p>
      <div className="prose mt-6 max-w-none text-text-primary dark:prose-invert">
        <p className="text-text-secondary">This is the article template. On the live platform it renders database content with unique metadata, Open Graph tags, and structured data.</p>
      </div>
    </article>
  );
}
