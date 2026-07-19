import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '@modules/auth/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { StorageService } from '@core/utils/storage';

/**
 * Global mutex flag tracking the operational state of ongoing asynchronous token rotation cycles.
 * Prevents overlapping network requests from dispatching duplicate refresh mutations concurrently.
 */
let isRefreshing = false;

/**
 * Reactive queue coordinator broadcasting access token rotation streams to stalled requests.
 * Holds a fallback null value initially, emitting the refreshed token payload once verified.
 */
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Functional HTTP pipeline interceptor managing client security metadata injection and token lifecycle recovery.
 * Hydrates outbound network payloads with active session bearer credentials and interceptively resolves
 * server exceptions to implement automatic token refresh flows for stale contexts.
 * 
 * @param req - Immutable outbound HTTP payload blueprint capturing the operation parameters.
 * @param next - Operational delegate link forwarding the transformed entity layout to subsequent channel handlers.
 * @returns Reactive observable pipeline processing upstream network event payloads and lifecycle cycles.
 * 
 * @remarks
 * This functional gateway automates multi-request queue interlocking when structural `401 Unauthorized` 
 * footprints are intercepted. While an initial thread dispatches a credential update payload, sub-threads 
 * block reactively inside a filtration pipeline via {@link refreshTokenSubject} until resolving safely.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const token = StorageService.get('access_token');
  let authReq = req;
  const isRefreshRequest = req.url.includes('/refresh');

  // Inject active session credentials into compatible outbound request targets
  if (token && !isRefreshRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. EXTRACT AND BROADCAST BACKEND ERROR SCHEMAS GLOBALLY
      if (!isRefreshRequest) {
        if (error.error && error.error.message) {
          const apiErrors = error.error.errors;
          toast.error(error.error.message, apiErrors);
        } else if (error.status === 0) {
          toast.error('No se pudo conectar con el servidor (CORS o Red)');
        } else {
          toast.error('Ha ocurrido un error inesperado');
        }
      }

      // 2. LIFECYCLE MANAGEMENT FOR EXPIRED SESSIONS (401 UNAUTHORIZED)
      if (error.status === 401 && !req.url.includes('/login') && !isRefreshRequest) {

        if (!isRefreshing) {
          // A. Primary thread trigger: Initialize token rotation routine
          isRefreshing = true;
          refreshTokenSubject.next(null); // Clear downstream broadcast channel

          return authService.refreshToken().pipe(
            switchMap((refreshRes) => {
              isRefreshing = false;
              // Broadcast newly rotated access token credentials to concurrent waiting operations
              refreshTokenSubject.next(refreshRes.access_token);

              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${refreshRes.access_token}`
                }
              });
              return next(retryReq);
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => refreshErr);
            })
          );
        } else {
          // B. Concurrent subsequent threads: Block execution and wait for primary rotation resolution
          return refreshTokenSubject.pipe(
            filter(newToken => newToken !== null), // Filter out initial null state frames
            take(1), // Auto-unsubscribe after receiving the first valid resolution emission
            switchMap((newToken) => {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(retryReq); // Retry operational request with active access credentials
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};