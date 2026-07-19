import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';
import { AuthService } from '@modules/auth/services/auth.service';

/**
 * Route protection guard for guest-only pages (e.g. Login, Registration).
 * Blocks access to authenticated users by redirecting them back to the dashboard panels.
 * 
 * @param route - The active route snapshot.
 * @param state - The active router state snapshot.
 * @returns Boolean resolving to true if guest access is allowed, false otherwise.
 */
export const publicGuard: CanActivateFn = (_, __) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true; // Acceso permitido (no está autenticado, puede ver Login/Register)
  }

  // Si ya tiene sesión, lo mandamos al panel principal
  console.log('[Guard] Sesión activa detectada. Redirigiendo al panel.');
  router.navigateByUrl(ROUTES_MAPPING.admin.dashboard);
  return false;
};