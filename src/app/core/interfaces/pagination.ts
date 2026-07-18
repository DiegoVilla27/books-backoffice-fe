/**
 * Interface representing a standard API pagination request query.
 */
export interface PaginationRequest {
  /** The 1-based index of the page index to request. */
  page: number;
  /** Maximum number of records to return per page chunk. */
  limit: number;
  /** Optional query string term used for name or text search filtering. */
  search?: string;
}

/**
 * Generic wrapper interface representing a paginated server response payload.
 *
 * @typeParam T - The data object type structure contained within the response list.
 */
export interface Pagination<T> {
  /** Array list source containing records matching the query constraints. */
  data: T[];
  /** Metadata parameters detailing pagination bounds. */
  pagination: {
    /** Grand total quantity count of active records matching the query in the database. */
    totalItems: number;
    /** Grand total count of pages calculated from totalItems and page limits. */
    totalPages: number;
    /** The active page index of the retrieved chunk (1-based index). */
    currentPage: number;
    /** The page size limit configuration representing maximum returned items. */
    limit: number;
  };
}