import type { IncomingMessage, ServerResponse } from 'node:http';
import { getGitHubDashboard } from '../src/lib/githubDashboard.js';

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const forceRefresh =
    new URL(req.url ?? '/', 'http://localhost').searchParams.get('refresh') === '1';

  try {
    const data = await getGitHubDashboard({
      forceRefresh,
      token: process.env.GITHUB_TOKEN?.trim(),
    });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ data }));
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Unable to fetch GitHub data',
      })
    );
  }
}
