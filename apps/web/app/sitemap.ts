import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const routes = ['', '/about', '/services', '/projects', '/blog', '/careers', '/contact', '/quote', '/login'];
  return routes.map((r) => ({ url: `${base}${r || '/'}`, lastModified: new Date(), changeFrequency: 'weekly', priority: r === '' ? 1 : 0.7 }));
}
