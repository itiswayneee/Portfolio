import type { IncomingMessage, ServerResponse } from 'node:http';
import { escapeHtml, getSiteData, slugifyHandle } from '../src/lib/seoEngine';
import { resolveRequestBaseUrl } from '../src/lib/requestUrl';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  const baseUrl = resolveRequestBaseUrl(req.headers);
  const { profile, updatedAt } = getSiteData();
  const slug = slugifyHandle(profile.slug);
  const lastmod = escapeHtml(updatedAt.split('T')[0]);
  const root = escapeHtml(`${baseUrl}/`);
  const profilePath = escapeHtml(`${baseUrl}/u/${slug}`);
  const handlePath = escapeHtml(`${baseUrl}/@${slug}`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${root}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${profilePath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${handlePath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(xml);
}
