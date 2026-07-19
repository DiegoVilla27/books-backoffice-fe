import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { publicGuard } from '@core/guards/public.guard';

/**
 * Root routing definitions for the Angular application.
 * Configures main redirection points, layout boundaries, and route protection guards.
 * Uses lazy-loaded child modules for Auth, Users, and Books features to optimize payload weight.
 */
export const ROUTES: Routes = [

  // Redirección por defecto al entrar a la raíz
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () => import('./modules/auth/routes/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    data: { breadcrumb: 'Admin' },
    canMatch: [authGuard],
    loadChildren: () => import('./modules/admin/routes/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // Ruta comodín para manejar páginas no encontradas (404)
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];