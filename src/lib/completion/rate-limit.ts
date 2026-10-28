type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const IP_LIMIT = 8;
const GLOBAL_LIMIT = 30;
const WINDOW_MS = 60_000;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

function hit(
  key: string,
  limit: number,
  now: number
): RateLimitResult {
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { ok: true };
}

function prune(now: number): void {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

/**
 * Per-IP and per-instance ceilings. Serverless isolates do not share this map;
 * it still stops a single instance from streaming unlimited advisor calls.
 */
export function allowAdvisorRequest(
  ip: string,
  now = Date.now()
): RateLimitResult {
  prune(now);
  const ipResult = hit(`ip:${ip}`, IP_LIMIT, now);
  if (!ipResult.ok) return ipResult;
  return hit("global", GLOBAL_LIMIT, now);
}

export function resetAdvisorRateLimit(): void {
  buckets.clear();
}

export function clientAddress(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
