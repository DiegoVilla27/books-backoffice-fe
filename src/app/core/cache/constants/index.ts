/**
 * Predefined cache lifespan thresholds (in milliseconds) used across the application.
 */
export const CACHE_TIMES = {
  /** Short duration (15 seconds) for highly dynamic data. */
  SHORT: 15 * 1000,
  /** Standard baseline duration (1 minute) for common lists. */
  DEFAULT: 60 * 1000,
  /** Long duration (5 minutes) for static dropdown lookups. */
  LONG: 5 * 60 * 1000,
  /** Max baseline duration (30 minutes) for system settings or config properties. */
  VERY_LONG: 30 * 60 * 1000
};

/**
 * Standardized namespace keys used to organize cache stores.
 */
export const KEY_QUERIES = {
  /** User profile collection queries. */
  USERS: 'users',
  /** General user selection directory references. */
  USERS_LOOKUP: 'users-lookup',
  /** Book catalog list queries. */
  BOOKS: 'books'
};