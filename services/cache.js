const cache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000;

export function getCachedResponse(key) {
  const cacheEntry = cache.get(key);
  if (!cacheEntry) return null;

  const { value, timestamp } = cacheEntry;
  if (Date.now() - timestamp > CACHE_EXPIRY) {
    cache.delete(key);
    return null;
  }

  return value;
}

export function setCachedResponse(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
}
