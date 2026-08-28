const buckets = new Map();

function createLimiter({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}`;
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || now - current.start >= windowMs) {
      buckets.set(key, { start: now, count: 1 });
      return next();
    }
    current.count += 1;
    if (current.count > max) {
      const retryAfter = Math.ceil((windowMs - (now - current.start)) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ success: false, message });
    }
    next();
  };
}

setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [key, bucket] of buckets) if (bucket.start < cutoff) buckets.delete(key);
}, 5 * 60 * 1000).unref();

export const apiLimiter = createLimiter({ windowMs: 60_000, max: 240, message: 'Too many requests. Please try again shortly.' });
export const authLimiter = createLimiter({ windowMs: 15 * 60_000, max: 30, message: 'Too many authentication attempts. Please try again later.' });
