import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router'; // 🚀 Cambiamos el tipo de importación
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { catchError, map, of } from 'rxjs';

/**
 * Route-matching guard for authenticated administrator management views.
 * Evaluates route segment matches strictly for verified account signatures,
 * blocking asset download over the network stream if authorization benchmarks fail.
 */
export const authGuard: CanMatchFn = (_, __) => {
  const authService = inject(AuthService);
  const toastSvc = inject(ToastService);

  // 1. Si ni siquiera tiene token guardado, denegamos el acceso inmediatamente
  if (!authService.isAuthenticated()) {
    console.warn('[CanMatch] Acceso denegado. Token ausente.');
    authService.logout();
    return false;
  }

  // 2. Si la Signal en memoria ya tiene al usuario, validamos su rol de forma síncrona
  const currentUser = authService.user();
  if (currentUser) {
    if (currentUser.role === 'ADMIN') {
      return true; // Coincidencia permitida, descarga el código
    }
    console.warn('[CanMatch] Acceso denegado. Permisos de Administrador requeridos.');
    authService.logout();
    return false;
  }

  // 3. 🚀 CONTROL DE F5 / ALMACENAMIENTO ALTERADO:
  // Si hay token pero la Signal está vacía, resincronizamos la identidad real contra el backend
  return authService.me().pipe(
    map(user => {
      if (user && user.role === 'ADMIN') {
        return true;
      }

      toastSvc.error('Acceso denegado. Se requieren permisos de Administrador.');
      authService.logout();
      return false;
    }),
    catchError(() => {
      console.error('[CanMatch] Sesión expirada o inválida durante la verificación.');
      authService.logout();
      return of(false);
    })
  );
};