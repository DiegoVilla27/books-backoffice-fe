/**
 * Interface representing dashboard metrics stats summary.
 */
export interface DashboardStats {
  /** Total number of books in the catalog. */
  totalBooks: number;
  /** Total number of users registered in the system. */
  totalUsers: number;
}

/**
 * Interface representing a single month's aggregated records for dashboard charts.
 */
export interface DashboardHistory {
  /**
   * The month represented as a two-digit string (e.g., "01", "02", ... "12").
   */
  month: string;
  /**
   * Collection of metric records containing the name of the metric type and its aggregated value.
   */
  records: {
    /**
     * The metric type name (e.g., "Libros", "Usuarios").
     */
    name: string;
    /**
     * The aggregated numeric value for the specified metric type and month.
     */
    value: number;
  }[];
}

/**
 * Interface representing a recent dashboard activity event. TEMPORAL !!!
 */
export interface Logs {
  /** Unique identifier of the activity event. */
  id: string;
  /** Text content describing the action. */
  message: string;
  /** Time description relative to current moment (e.g. "Hace 5 minutos"). */
  time: string;
  /** Category type grouping events: USER, BOOK, or LOG. */
  type: 'USER' | 'BOOK' | 'LOG';
}
