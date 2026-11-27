import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  escapeHtml,
  generateSeoHeadHtml,
  getSiteData,
  slugifyHandle,
  UserSiteData,
} from './src/lib/seoEngine.js';
import { getGitHubDashboard } from './src/lib/githubDashboard.js';

const PORT = Number(process.env.PORT) || 3000;

function resolveBaseUrl(req: express.Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured && configured !== 'MY_APP_URL') {
    return configured.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

function injectSeoIntoIndexHtml(
  htmlTemplate: string,
  data: UserSiteData,
  baseUrl: string
): string {
  const headTags = generateSeoHeadHtml(data, baseUrl);
  const stripped = htmlTemplate
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?\/>/gi, '')
    .replace(
      /<meta\s+(?:name|property)="(?:description|robots|author|og:[^"]+|twitter:[^"]+|profile:[^"]+)"[\s\S]*?\/>/gi,
      ''
    )
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  const injectedHead = stripped.replace('</head>', `    ${headTags}\n  </head>`);
  const displayHandle = `@${data.profile.alternateName.replace(/^@/, '')}`;

  const crawlableSummary = `
      <main style="max-width:680px;margin:48px auto;padding:0 20px;font-family:system-ui,sans-serif">
        <h1>${escapeHtml(data.profile.fullName)} (${escapeHtml(displayHandle)})</h1>
        <p>${escapeHtml(data.profile.shortBio)}</p>
        <p><a href="mailto:${escapeHtml(data.profile.contactEmail)}">${escapeHtml(data.profile.contactEmail)}</a></p>
        <ul>
          ${data.socials
            .map(
              (s) =>
                `<li><a href="${escapeHtml(s.url)}">${escapeHtml(s.label)} (${escapeHtml(s.handle)})</a></li>`
            )
            .join('\n          ')}
        </ul>
      </main>`;

  return injectedHead.replace(
    '<div id="root"></div>',
    `<div id="root">${crawlableSummary}</div>`
  );
}

function renderPublicProfileHtml(data: UserSiteData, baseUrl: string): string {
  const headTags = generateSeoHeadHtml(data, baseUrl);
  const displayHandle = `@${data.profile.alternateName.replace(/^@/, '')}`;
  const socialRows = data.socials
    .map(
      (s) => `
      <a class="row" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer me">
        <span class="label">${escapeHtml(s.label)}</span>
        <span class="handle">${escapeHtml(s.handle)}</span>
      </a>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${headTags}
    <style>
      body{margin:0;background:#050507;color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,"DM Sans",system-ui,sans-serif;line-height:1.5}
      main{max-width:620px;margin:0 auto;padding:48px 20px 64px}
      .card{background:linear-gradient(180deg,rgba(30,30,36,.92),rgba(21,21,26,.96));border:1px solid rgba(255,255,255,.09);border-radius:24px;padding:28px;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 18px 40px -12px rgba(0,0,0,.65);margin-bottom:20px}
      .top{display:flex;align-items:center;gap:18px;margin-bottom:14px}
      .avatar{width:72px;height:72px;border-radius:18px;object-fit:cover;border:1px solid rgba(255,255,255,.12)}
      h1{margin:0 0 4px;font-size:28px;letter-spacing:-.02em}
      .handle{color:#a1a1aa;font-family:monospace;font-size:14px}
      p{color:#d4d4d8;font-size:15px}
      .list{padding:0;overflow:hidden}
      .row{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;color:inherit;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.07)}
      .row:last-child{border-bottom:none}
      .row:hover{background:rgba(255,255,255,.04)}
      .label{font-weight:600}
      a.home{color:#0a84ff;text-decoration:none;font-size:14px}
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <div class="top">
          <img class="avatar" src="${escapeHtml(data.profile.avatarImage)}" alt="${escapeHtml(data.profile.fullName)}" />
          <div>
            <h1>${escapeHtml(data.profile.fullName)}</h1>
            <div class="handle">${escapeHtml(displayHandle)}</div>
          </div>
        </div>
        <p>${escapeHtml(data.profile.shortBio)}</p>
        <a class="home" href="/">Open full interactive page</a>
      </div>
      <div class="card list">
        ${socialRows}
      </div>
    </main>
  </body>
</html>`;
}

async function startServer() {
  const app = express();
  const siteData = getSiteData();

  app.get('/api/profile', (_req, res) => {
    res.json({ data: siteData });
  });

  app.get('/api/github', async (req, res) => {
    try {
      const data = await getGitHubDashboard({
        forceRefresh: req.query.refresh === '1',
        token: process.env.GITHUB_TOKEN?.trim(),
      });
      res.json({ data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to fetch GitHub data';
      res.status(502).json({ error: message });
    }
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const slug = slugifyHandle(siteData.profile.slug);
    const lastmod = siteData.updatedAt.split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeHtml(baseUrl)}/</loc>
    <lastmod>${escapeHtml(lastmod)}</lastmod>
  </url>
  <url>
    <loc>${escapeHtml(baseUrl)}/u/${escapeHtml(slug)}</loc>
    <lastmod>${escapeHtml(lastmod)}</lastmod>
  </url>
  <url>
    <loc>${escapeHtml(baseUrl)}/@${escapeHtml(slug)}</loc>
    <lastmod>${escapeHtml(lastmod)}</lastmod>
  </url>
</urlset>`;
    res.type('application/xml').send(xml);
  });

  const handleProfileRoute = (req: express.Request, res: express.Response) => {
    const activeSlug = slugifyHandle(siteData.profile.slug);
    const requestedSlug = slugifyHandle(req.params.slug);
    const baseUrl = resolveBaseUrl(req);

    if (requestedSlug !== activeSlug) {
      res
        .status(404)
        .type('text/html')
        .send(
          `<!doctype html><html lang="en" class="dark"><head><meta charset="UTF-8" /><title>Not found</title><style>body{font-family:system-ui,sans-serif;background:#050507;color:#f5f5f7;max-width:520px;margin:80px auto;padding:0 24px}a{color:#0a84ff}</style></head><body><h1>Profile not found</h1><p><a href="/">Go to @${escapeHtml(activeSlug)}</a></p></body></html>`
        );
      return;
    }

    res.type('text/html').send(renderPublicProfileHtml(siteData, baseUrl));
  };

  app.get('/u/:slug', handleProfileRoute);
  app.get('/@:slug', handleProfileRoute);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.get('/', async (req, res, next) => {
      try {
        const baseUrl = resolveBaseUrl(req);
        const rawHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const seoHtml = injectSeoIntoIndexHtml(rawHtml, siteData, baseUrl);
        const transformed = await vite.transformIndexHtml(req.originalUrl, seoHtml);
        res.status(200).type('text/html').send(transformed);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.get('/', (req, res) => {
      const baseUrl = resolveBaseUrl(req);
      const rawHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
      const seoHtml = injectSeoIntoIndexHtml(rawHtml, siteData, baseUrl);
      res.status(200).type('text/html').send(seoHtml);
    });
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      const baseUrl = resolveBaseUrl(req);
      const rawHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
      const seoHtml = injectSeoIntoIndexHtml(rawHtml, siteData, baseUrl);
      res.status(200).type('text/html').send(seoHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Samwel Wayne site running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
