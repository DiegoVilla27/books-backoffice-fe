import { PaginationRequest } from "@core/interfaces/pagination";

/**
 * Data contract representing search filters and criteria parameters for user account management queries.
 * Extends base operational pagination tracking specifications to combine index window boundaries 
 * with structural role mapping constraints and lifecycle status parameters.
 */
export interface FilterUsersRequest extends PaginationRequest {
  /**
   * Optional system classification level utilized to segment account records.
   * Restricts user data grid responses strictly to profiles carrying matching organizational permissions.
   * 
   * - `'ADMIN'`: Access layer restricted to backoffice system operators.
   * - `'USER'`: Access layer assigned to standard platform consumers.
   * - `''`: Empty state placeholder matching any permission layer without constraints.
   */
  role?: 'ADMIN' | 'USER' | '';

  /**
   * Optional operational state tracking index.
   * Serves as an index lookup key to isolate system access behaviors.
   * Passed as a string parameter to handle unified text inputs or specific boolean flag string equivalents from query streams.
   */
  isActive?: string;
}

/**
 * Interface representing a User entity returned by the API.
 */
export interface User {
  /** Unique user identifier. */
  id: number;
  /** First name of the user. */
  name: string;
  /** Last name of the user. */
  lastname: string;
  /** Unique email address of the user. */
  email: string;
  /** Encrypted password string. */
  password: string;
  /** Age of the user. */
  age: number;
  /** User level privilege role: USER or ADMIN. */
  role: 'USER' | 'ADMIN';
  /** Logical soft-delete status flag. */
  isActive: boolean;
  /** Total count of books currently owned by this user. */
  quantityBooks: number;
  /** Creation timestamp string. */
  createdAt: string;
  /** Last update timestamp string, or null if never modified. */
  updatedAt: string | null;
}

/**
 * Type representing request payload required to create a new User.
 */
export type CreateUserRequest = Omit<User, 'id' | 'isActive' | 'quantityBooks' | 'createdAt' | 'updatedAt'>

/**
 * Type representing request payload to partially update a User.
 */
export type UpdateUserRequest = Partial<Omit<User, 'id' | 'quantityBooks' | 'createdAt' | 'updatedAt'>>