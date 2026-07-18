import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { Pagination } from '@core/interfaces/pagination';
import { buildCleanHttpParams } from '@core/utils/http-params';
import {
  Book,
  CreateBookRequest,
  FilterBooksRequest,
  UpdateBookRequest
} from '../interfaces';
import { cacheHttp, invalidateCache, KEY_QUERIES } from '@core/cache';

/**
 * Service managing Books module business transactions with backend API resources.
 */
@Injectable({
  providedIn: 'root'
})
export class BooksService {
  /** Injected HTTP client utility for backend API communication. */
  private http = inject(HttpClient);

  /** API Endpoint url for books requests. */
  private readonly API_URL = `${environment.apiUrl}/books`;

  /**
   * Retrieves a paginated directory of registered books.
   * 
   * @param payload - Page indices and maximum item limits requests configurations.
   * @returns Observable stream containing the paginated books wrap data.
   */
  getAll(payload: FilterBooksRequest): Observable<Pagination<Book>> {
    const cleanParams = buildCleanHttpParams(payload);
    const request$ = this.http.get<Pagination<Book>>(this.API_URL, { params: cleanParams });
    return cacheHttp([KEY_QUERIES.BOOKS, payload], request$);
  }

  /**
   * Retrieves detail data of a specific book by ID.
   * 
   * @param id - Unique identifier of the target book.
   * @returns Observable stream containing the book data.
   */
  getById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/${id}`);
  }

  /**
   * Creates a new book record.
   * 
   * @param payload - The request schema details of the new book.
   * @returns Observable stream containing the saved book representation.
   */
  create(payload: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(`${this.API_URL}`, payload).pipe(
      tap(() => invalidateCache([KEY_QUERIES.BOOKS]))
    );
  }

  /**
   * Modifies an existing book records.
   * 
   * @param id - Unique identifier of the target book.
   * @param payload - The partial properties updates payload.
   * @returns Observable stream containing the updated book representation.
   */
  update(id: number, payload: UpdateBookRequest): Observable<Book> {
    return this.http.patch<Book>(`${this.API_URL}/${id}`, payload).pipe(
      tap(() => invalidateCache([KEY_QUERIES.BOOKS]))
    );
  }

  /**
   * Deletes a book record from database.
   * 
   * @param id - Unique identifier of the target book.
   * @returns Observable stream containing the deleted book representation.
   */
  delete(id: number): Observable<Book> {
    return this.http.delete<Book>(`${this.API_URL}/${id}`).pipe(
      tap(() => invalidateCache([KEY_QUERIES.BOOKS]))
    );
  }
}