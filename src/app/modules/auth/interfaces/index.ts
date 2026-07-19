import { User } from "@modules/admin/pages/users/interfaces";

/**
 * Client session metadata projection model.
 * Constructs a strict subset of the primary {@link User} entity contract, stripping 
 * sensitive core footprints (such as hash keys, credentials, or internal timestamps) 
 * before exposing the entity profile state to the presentation framework layer.
 * 
 * @remarks
 * Extracted explicitly via TypeScript's utility primitive `Pick<T, K>` to preserve 
 * downstream typing structural synchronization with the database source models.
 * Used heavily across {@link AuthService} state routines and route guard context resolution rules.
 */
export type MeResponse = Pick<User, 'id' | 'name' | 'lastname' | 'email' | 'role'>;

/**
 * Interface representing a user registration payload.
 */
export interface RegisterRequest {
  /** The first name of the user. */
  name: string;
  /** The last name of the user. */
  lastname: string;
  /** The email address of the user (must be unique). */
  email: string;
  /** The password chosen by the user. */
  password?: string;
  /** Confirmation password to ensure typing accuracy. */
  passwordConfirmation?: string;
  /** Age of the user. */
  age: number;
}

/**
 * Interface representing a login payload.
 */
export interface LoginRequest {
  /** The authenticating user's email address. */
  email: string;
  /** The authenticating user's password. */
  password?: string;
}

/**
 * Interface representing the authorization response from the Express API.
 */
export interface AuthResponse {
  /** Signed access token JWT. */
  access_token: string;
  /** Signed refresh token JWT. */
  refresh_token: string;
  /** Expiration lifespan of the access token in seconds. */
  expires_in: number;
}