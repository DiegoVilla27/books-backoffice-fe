import { Routes } from '@angular/router';

/**
 * Route configurations for the System Logs feature module.
 * Wraps the list component under the common MainLayoutComponent.
 */
export const LOGS_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: '' },
    loadComponent: () => import('../pages/list/list.component').then(m => m.LogListComponent)
  }
];
