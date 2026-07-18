import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../interfaces';
import { environment } from '@env/environment';
import { StorageService } from '@core/utils/storage';

/**
 * Service managing user session states, sign-up, sign-in, and JWT lifecycle processes.
 * Handles tokens serialization in local storage and manages background recovery.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Injected HTTP client utility for backend API communication. */
  private http = inject(HttpClient);
  /** Injected Angular Router for location changes. */
  private router = inject(Router);

  /** Base API endpoint loaded from active environment config. */
  private readonly API_URL = environment.apiUrl;

  /**
   * Dispatches user registration details to the endpoint server.
   * On success, initializes session authentication headers.
   * 
   * @param payload - Complete user details schema for account registration.
   * @returns Observable stream containing the validation tokens.
   */
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, payload).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  /**
   * Performs user verification with provided sign-in credentials.
   * Initializes authorization tokens on successful login.
   * 
   * @param credentials - User authentication keys.
   * @returns Observable stream containing the validation tokens.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  /**
   * Requests a new access token using the stored refresh token.
   * Dispatched automatically by the HTTP interceptor upon capturing 401 exceptions.
   * Cleans local session records and navigates back to Login on failure.
   * 
   * @returns Observable stream containing the rotated authorization tokens.
   */
  refreshToken(): Observable<AuthResponse> {
    const refresh_token = StorageService.get('refresh_token');

    if (!refresh_token) {
      this.logout();
      return throwError(() => new Error('No existe el token de refresco'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refresh_token }).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        // Si el refresco también falla, la sesión está muerta de verdad
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Resets local session cache and forces navigation to the auth login page.
   */
  logout(): void {
    this.clearStorage();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Checks if a valid session access token is cached locally.
   * 
   * @returns True if access token exists, false otherwise.
   */
  public isAuthenticated(): boolean {
    return !!StorageService.has('access_token');
  }

  /**
   * Caches response tokens into local storage.
   * 
   * @param response - Response object containing access and refresh tokens.
   */
  private handleAuthentication(response: AuthResponse): void {
    StorageService.set('access_token', response.access_token);
    StorageService.set('refresh_token', response.refresh_token);
  }

  /**
   * Purges session tokens from the local cache.
   */
  private clearStorage(): void {
    StorageService.remove('access_token');
    StorageService.remove('refresh_token');
  }
}