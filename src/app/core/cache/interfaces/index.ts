import { Observable } from "rxjs";

/**
 * Options configuration overrides when calling cache utility functions.
 */
export interface CacheOptions {
  /** Time to live in milliseconds before cache entry self-destruction. */
  ttl?: number;
}

/**
 * Representation profile of a stored item in the global cache map.
 *
 * @typeParam T - The raw data payload object model representation.
 */
export interface CacheEntry<T> {
  /** Cached resolved data payload. Undefined if request is in-flight. */
  data?: T;
  /** Active shared in-flight request observable used to de-duplicate parallel queries. */
  observable$?: Observable<T>;
  /** Timestamp record of when the entry was stored (used for TTL verification). */
  timestamp: number;
  /** Individual customized time-to-live parameter. */
  ttl: number;
}