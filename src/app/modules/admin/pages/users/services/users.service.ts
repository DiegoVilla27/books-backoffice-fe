import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { Pagination } from '@core/interfaces/pagination';
import { buildCleanHttpParams } from '@core/utils/http-params';
import {
  CreateUserRequest,
  FilterUsersRequest,
  UpdateUserRequest,
  User
} from '../interfaces';
import { cacheHttp, invalidateCache, KEY_QUERIES, CACHE_TIMES } from '@core/cache';

/**
 * Service managing Users module transactions with backend API resources.
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  /** Injected HTTP client utility for backend API communication. */
  private http = inject(HttpClient);

  /** API Endpoint url for users requests. */
  private readonly API_URL = `${environment.apiUrl}/users`;

  /**
   * Retrieves a simplified listing of active users for dropdown options.
   * 
   * @returns Observable stream containing lookup users collection.
   */
  getLookup(): Observable<User[]> {
    const request$ = this.http.get<User[]>(`${this.API_URL}/lookup`);
    return cacheHttp([KEY_QUERIES.USERS_LOOKUP], request$, { ttl: CACHE_TIMES.LONG });
  }

  /**
   * Retrieves a paginated directory of registered users.
   * 
   * @param payload - Page indices and maximum item limits requests configurations.
   * @returns Observable stream containing paginated users wrap data.
   */
  getAll(payload: FilterUsersRequest): Observable<Pagination<User>> {
    const cleanParams = buildCleanHttpParams(payload);
    const request$ = this.http.get<Pagination<User>>(this.API_URL, { params: cleanParams });
    return cacheHttp([KEY_QUERIES.USERS, payload], request$);
  }

  /**
   * Retrieves detail data of a specific user by ID.
   * 
   * @param id - Unique identifier of the target user.
   * @returns Observable stream containing the user data.
   */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  /**
   * Creates and registers a new user record.
   * 
   * @param payload - The request schema details of the new user.
   * @returns Observable stream containing the saved user representation.
   */
  create(payload: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}`, payload).pipe(
      tap(() => invalidateCache([KEY_QUERIES.USERS, KEY_QUERIES.USERS_LOOKUP]))
    );
  }

  /**
   * Modifies an existing user record.
   * 
   * @param id - Unique identifier of the target user.
   * @param payload - The partial properties updates payload.
   * @returns Observable stream containing the updated user representation.
   */
  update(id: number, payload: UpdateUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}`, payload).pipe(
      tap(() => invalidateCache([KEY_QUERIES.USERS, KEY_QUERIES.USERS_LOOKUP]))
    );
  }

  /**
   * Performs soft deletion/deactivation of a user record.
   * 
   * @param id - Unique identifier of the target user.
   * @returns Observable stream containing the deactivated user representation.
   */
  delete(id: number): Observable<User> {
    return this.http.delete<User>(`${this.API_URL}/${id}`).pipe(
      tap(() => invalidateCache([KEY_QUERIES.USERS, KEY_QUERIES.USERS_LOOKUP]))
    );
  }

  /**
   * Checks if an email already exists in the database.
   * 
   * @param email - The email to check.
   * @returns Observable stream containing a boolean indicating if the email exists.
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.API_URL}/check-email`, { email });
  }
}