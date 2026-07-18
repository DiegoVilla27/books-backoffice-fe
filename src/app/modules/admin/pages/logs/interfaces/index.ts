/**
 * Represents the log severity/level.
 */
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

/**
 * Interface representing a system audit log record.
 */
export interface Log {
  /** Unique identifier of the log record. */
  id: string;
  /** Action event category (e.g. USER_LOGIN, BOOK_CREATE). */
  action: string;
  /** Severity level indicator of the log event. */
  level: LogLevel;
  /** Detailed descriptive log entry text. */
  message: string;
  /** Operator name or email who triggered the event. */
  operator: string;
  /** IP address from where the operation was executed. */
  ip: string;
  /** ISO timestamp string when the event occurred. */
  timestamp: string;
}
