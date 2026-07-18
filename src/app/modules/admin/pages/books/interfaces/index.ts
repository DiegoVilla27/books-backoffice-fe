import { PaginationRequest } from "@core/interfaces/pagination";

export interface FilterBooksRequest extends PaginationRequest {
  userId?: string;
}

/**
 * Interface representing a Book entity returned by the API.
 */
export interface Book {
  /** Unique identifier of the book record. */
  id: number;
  /** Title of the book. */
  title: string;
  /** Author name of the book. */
  author: string;
  /** Unique identifier of the owner user who registered the book. */
  userId: number;
  /** Detailed object of the owner user. */
  user: {
    /** Unique identifier of the owner. */
    id: number;
    /** First name of the owner. */
    name: string;
    /** Last name of the owner. */
    lastname: string;
  };
  /** Creation timestamp string. */
  createdAt: string;
  /** Last modification timestamp string. */
  updatedAt: string;
}

/**
 * Type representing request payload required to create a new Book.
 */
export type CreateBookRequest = Omit<Book, 'id' | 'user' | 'createdAt' | 'updatedAt'>

/**
 * Type representing request payload to partially update a Book.
 */
export type UpdateBookRequest = Partial<Omit<Book, 'id' | 'user' | 'createdAt' | 'updatedAt'>>