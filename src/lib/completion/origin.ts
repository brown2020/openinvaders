/**
 * Browser advisor calls include Origin. Reject a present Origin that does not
 * match the request host. Missing Origin is allowed and still rate-limited;
 * the body itself is an event allowlist, not a free-form prompt.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  const hostHeader =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!hostHeader) return false;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const requestHost = hostHeader.split(",")[0]?.trim();
  return originHost === requestHost;
}
