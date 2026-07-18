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