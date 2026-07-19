import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '@modules/auth/services/auth.service';
import { ToastService } from '@core/services/toast.service'; // <-- Importamos tu Toast
import { StorageService } from '@core/utils/storage';

/**
 * Interceptor function for managing client request authorization and session recovery.
 * Injects `Bearer <access_token>` authorization header to all outbound API calls.
 * Catches 401 HTTP unauthorized response status codes to trigger reactive silents token rotation
 * and resumes original calls cleanly upon verification.
 * 
 * @param req - Outgoing Http Request representation.
 * @param next - Next handler delegate in the HTTP pipeline.
 * @returns Observable stream handling the HTTP events and interception cycles.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService); // <-- Inyectamos el Toast
  const token = StorageService.get('access_token');

  let authReq = req;
  const isRefreshRequest = req.url.includes('/auth/refresh');

  if (token && !isRefreshRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // 1. EXTRAER Y MOSTRAR EL MENSAJE DE ERROR GLOBALMENTE
      // Evitamos mostrar toast en el refresco silencioso para que no sea molesto si expira la sesión de fondo
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

      // 2. GESTIÓN DEL FLUJO DE SESIÓN EXPIRADA (401)
      if (error.status === 401 && !req.url.includes('/login') && !isRefreshRequest) {
        return authService.refreshToken().pipe(
          switchMap((refreshRes) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshRes.access_token}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};