import { Observable, of, throwError } from "rxjs";
import { catchError, shareReplay, tap } from "rxjs";
import { CacheEntry, CacheOptions } from "../interfaces";
import { CACHE_TIMES } from "../constants";

const GLOBAL_CACHE = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = CACHE_TIMES.DEFAULT; // 1 minute
const MAX_CACHE_SIZE = 100;

/**
 * Serializes any cache key structure (string, object, array, or number) into a unique string key representation.
 *
 * @param key - The cache key structure to be serialized.
 * @returns The stringified unique key representation.
 */
const serializeKey = (key: any): string => {
  if (typeof key === 'string') {
    return key;
  }
  try {
    return JSON.stringify(key);
  } catch {
    return String(key);
  }
};

/**
 * Enforces a maximum size limit on the global cache store using a cleanup strategy
 * that purges expired items first, followed by the oldest entries if the size is still over the limit.
 */
const enforceCacheLimit = (): void => {
  if (GLOBAL_CACHE.size <= MAX_CACHE_SIZE) return;

  const now = Date.now();

  // 1. Purge expired entries
  GLOBAL_CACHE.forEach((value, key) => {
    if (value.data !== undefined && (now - value.timestamp >= value.ttl)) {
      GLOBAL_CACHE.delete(key);
    }
  });

  // 2. If still over limit, evict the oldest entry
  if (GLOBAL_CACHE.size > MAX_CACHE_SIZE) {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    GLOBAL_CACHE.forEach((value, key) => {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      GLOBAL_CACHE.delete(oldestKey);
    }
  }
};

/**
 * Standalone professional utility that caches HTTP requests, deduplicates concurrent
 * in-flight queries, automatically clears failed requests, and respects TTL.
 *
 * @remarks
 * This function handles multi-cast query flows using `shareReplay` under the hood.
 * If a request fails, the cache entry is immediately removed to ensure future retries.
 *
 * @typeParam T - The shape of the expected payload data structure.
 * @param key - Unique lookup identifier (can be a composite array or plain string namespace).
 * @param request$ - Cold observable stream containing the actual HTTP request.
 * @param options - Cache config overrides containing custom TTL rules.
 * @returns Observable stream resolving to either cached or fresh payload response.
 *
 * @example
 * ```typescript
 * const req$ = this.http.get<User>('/user/profile');
 * return cacheHttp(['user-profile', userId], req$, { ttl: 60000 });
 * ```
 */
export const cacheHttp = <T>(
  key: any,
  request$: Observable<T>,
  options: CacheOptions = {}
): Observable<T> => {
  const cacheKey = serializeKey(key);
  const now = Date.now();
  const ttl = options.ttl ?? DEFAULT_TTL;

  const cached = GLOBAL_CACHE.get(cacheKey);

  // Case 1: Valid cached data exists
  if (cached && cached.data !== undefined && (now - cached.timestamp < cached.ttl)) {
    return of(cached.data);
  }

  // Case 2: Deduplication: A request is already in-flight for this key
  if (cached && cached.observable$) {
    return cached.observable$;
  }

  // Case 3: Cache miss or cache expired. Initialize a new shared request stream.
  const sharedRequest$ = request$.pipe(
    tap((data) => {
      GLOBAL_CACHE.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl
      });
      enforceCacheLimit();
    }),
    catchError((err) => {
      // Invalidate the cache entry on failure so next subscription triggers a retry
      GLOBAL_CACHE.delete(cacheKey);
      return throwError(() => err);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Store the active observable to deduplicate concurrent subscriptions
  GLOBAL_CACHE.set(cacheKey, {
    observable$: sharedRequest$,
    timestamp: now,
    ttl
  });

  return sharedRequest$;
};

/**
 * Invalidates cache entries matching a specific string namespace, string prefix,
 * array-like namespace, or RegExp pattern.
 *
 * @remarks
 * Safe to pass simple namespace strings or composite keys. It loops through all
 * active cache keys and checks for pattern matches or starts-with queries.
 *
 * @param patterns - Array of keys, prefix namespaces, or regex patterns to invalidate.
 *
 * @example
 * ```typescript
 * // Invalidate everything matching 'users' namespace:
 * invalidateCache(['users']);
 * ```
 */
export const invalidateCache = (patterns: any[]): void => {
  // Aseguramos que tratamos con cada patrón de forma individual
  patterns.forEach((pattern) => {
    const serializedPattern = typeof pattern === 'string'
      ? pattern
      : pattern instanceof RegExp
        ? pattern
        : serializeKey(pattern);

    GLOBAL_CACHE.forEach((_, key) => {
      if (serializedPattern instanceof RegExp) {
        if (serializedPattern.test(key)) {
          GLOBAL_CACHE.delete(key);
        }
      } else {
        const matches =
          key === serializedPattern ||
          key.startsWith(serializedPattern) ||
          key.startsWith(`["${serializedPattern}"`) ||
          key.includes(`"${serializedPattern}"`);

        if (matches) {
          GLOBAL_CACHE.delete(key);
        }
      }
    });
  });
};

/**
 * Clears the entire cache store.
 */
export const clearCache = (): void => {
  GLOBAL_CACHE.clear();
};

/**
 * Retrieves a detailed, read-only snapshot array of all active entries in the cache store.
 *
 * @returns Array representation of all cached items, their status, keys, and expiration flags.
 */
export const getCacheSnapshot = () => {
  const snapshot: { key: string; data: any; hasObservable: boolean; timestamp: number; ttl: number; expired: boolean }[] = [];
  const now = Date.now();

  GLOBAL_CACHE.forEach((value, key) => {
    snapshot.push({
      key,
      data: value.data,
      hasObservable: !!value.observable$,
      timestamp: value.timestamp,
      ttl: value.ttl,
      expired: value.data !== undefined && (now - value.timestamp >= value.ttl)
    });
  });

  return snapshot;
};