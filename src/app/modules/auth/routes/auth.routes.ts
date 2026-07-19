import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '@shared/layouts/auth-layout/auth-layout.component';

/**
 * Route configurations for the Authentication module.
 * Wraps child views (Login, Register) inside the common AuthLayoutComponent framework.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent, // <-- Todas las rutas hijas se renderizarán dentro de este Layout
    children: [
      {
        path: 'login',
        loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('../pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  }
];