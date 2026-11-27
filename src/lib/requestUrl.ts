import type { IncomingHttpHeaders } from 'node:http';

export function resolveRequestBaseUrl(
  headers: IncomingHttpHeaders,
  fallbackHost = 'localhost'
): string {
  const configured = process.env.APP_URL?.trim();
  if (configured && configured !== 'MY_APP_URL') {
    return configured.replace(/\/+$/, '');
  }
  const header = (name: string): string | undefined => {
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  const proto = (header('x-forwarded-proto') || 'http').split(',')[0].trim();
  const host = header('x-forwarded-host') || header('host') || fallbackHost;
  return `${proto}://${host}`;
}
