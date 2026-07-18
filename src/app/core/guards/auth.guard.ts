import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@modules/auth/services/auth.service';

/**
 * Route protection guard for authenticated routes (e.g. Users, Books).
 * Restricts access to authenticated clients, redirecting unauthenticated users to the Login view.
 * 
 * @param route - The active route snapshot.
 * @param state - The active router state snapshot.
 * @returns Boolean resolving to true if access is granted, false otherwise.
 */
export const authGuard: CanActivateFn = (_, __) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // Acceso permitido
  }

  // Redirigir al login si no está autenticado
  console.warn('[Guard] Acceso denegado. Redirigiendo a Login.');
  router.navigate(['/auth/login']);
  return false;
};