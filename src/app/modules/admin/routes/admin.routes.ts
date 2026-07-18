// src/app/modules/auth/routes/auth.routes.ts
import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '@shared/layouts/admin-layout/admin-layout.component';

/**
 * Route configurations for the Authentication module.
 * Wraps child views (Login, Register) inside the common AuthLayoutComponent framework.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: '' },
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        data: { breadcrumb: '' },
        loadChildren: () => import('../pages/dashboard/routes/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'users',
        data: { breadcrumb: 'Usuarios' },
        loadChildren: () => import('../pages/users/routes/users.routes').then(m => m.USERS_ROUTES)
      },
      {
        path: 'books',
        data: { breadcrumb: 'Libros' },
        loadChildren: () => import('../pages/books/routes/books.routes').then(m => m.BOOKS_ROUTES)
      },
      {
        path: 'logs',
        data: { breadcrumb: 'Logs' },
        loadChildren: () => import('../pages/logs/routes/logs.routes').then(m => m.LOGS_ROUTES)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];