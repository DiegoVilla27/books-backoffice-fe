/**
 * Interface representing dashboard metrics stats summary.
 */
export interface DashboardStats {
  /** Total number of users registered in the system. */
  totalUsers: number;
  /** Total number of books in the catalog. */
  totalBooks: number;
  /** Total number of books currently on loan. */
  activeLoans: number;
  /** Health check condition status: EXCELLENT, STABLE, or CRITICAL. */
  systemHealth: 'EXCELLENT' | 'STABLE' | 'CRITICAL';
}

/**
 * Interface representing a recent dashboard activity event.
 */
export interface RecentActivity {
  /** Unique identifier of the activity event. */
  id: string;
  /** Text content describing the action. */
  message: string;
  /** Time description relative to current moment (e.g. "Hace 5 minutos"). */
  time: string;
  /** Category type grouping events: USER, BOOK, or LOG. */
  type: 'USER' | 'BOOK' | 'LOG';
}
