import { Routes } from '@angular/router';

/**
 * Route configurations for the Dashboard feature module.
 * Wraps the dashboard layout component inside the MainLayoutComponent.
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Dashboard' },
    loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  }
];
