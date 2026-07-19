import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { cacheHttp, KEY_QUERIES } from '@core/cache';
import { ToastService } from '@core/services/toast.service';
import { environment } from '@env/environment';
import { finalize } from 'rxjs';
import { DashboardHistory, DashboardStats } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  /**
   * Signal to hold the aggregated dashboard statistics.
   */
  private _stats = signal<DashboardStats | null>(null);
  /**
   * Readonly view of the dashboard statistics signal.
   */
  stats = this._stats.asReadonly();
  /**
   * Signal to indicate whether the dashboard statistics are loading.
   */
  private _loadingStats = signal<boolean>(true);
  /**
   * Readonly view of the dashboard statistics loading state.
   */
  loadingStats = this._loadingStats.asReadonly();
  /**
   * Signal to hold the aggregated dashboard history.
   */
  private _history = signal<DashboardHistory[]>([]);
  /**
   * Readonly view of the dashboard history signal.
   */
  history = this._history.asReadonly();
  /**
   * Signal to indicate whether the dashboard history is loading.
   */
  private _loadingHistory = signal<boolean>(true);
  /**
   * Readonly view of the dashboard history loading state.
   */
  loadingHistory = this._loadingHistory.asReadonly();

  /** Injected HTTP client utility for backend API communication. */
  private http = inject(HttpClient);
  /** Injected Toast service utility for notification. */
  private toastSvc = inject(ToastService);

  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  /**
   * Dispatches a GET request to the backend service to retrieve the aggregated statistics.
   * Uses NgRx Effects in conjunction with the HttpClient to perform the async operation.
   * 
   * @returns Observable<DashboardStats> that will emit the aggregated dashboard statistics.
   */
  getStats(): void {
    const request$ = this.http.get<DashboardStats>(`${this.API_URL}/stats`);

    cacheHttp([KEY_QUERIES.STATS], request$)
      .pipe(finalize(() => this._loadingStats.set(false)))
      .subscribe({
        next: (stats) => Promise.resolve().then(() => this._stats.set(stats)),
        error: (err) => this.toastSvc.error(err.error.message)
      });;
  }

  /**
   * Dispatches a GET request to the backend service to retrieve the aggregated historical data for a given year.
   * Uses NgRx Effects in conjunction with the HttpClient to perform the async operation.
   * 
   * @param year - The integer year for which to retrieve historical data.
   * 
   * @returns Observable<DashboardHistory[]> that will emit the historical data organized by month.
   */
  getHistory(year: number): void {
    const request$ = this.http.get<DashboardHistory[]>(`${this.API_URL}/history`, { params: { year } });

    cacheHttp([KEY_QUERIES.HISTORY, year], request$)
      .pipe(finalize(() => this._loadingHistory.set(false)))
      .subscribe({
        next: (history) => Promise.resolve().then(() => this._history.set(history)),
        error: (err) => this.toastSvc.error(err.error.message)
      });
  }
}
