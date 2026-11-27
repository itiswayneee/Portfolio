import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveRequestBaseUrl } from '../src/lib/requestUrl.js';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  const baseUrl = resolveRequestBaseUrl(req.headers);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
}
