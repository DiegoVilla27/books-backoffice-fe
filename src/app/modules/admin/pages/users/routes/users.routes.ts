// src/app/modules/users/routes/users.routes.ts
import { Routes } from '@angular/router';
import { formEditableGuard } from '@core/guards/form-editable.guard';

/**
 * Route configurations for the Users feature module.
 * Embeds list, creation, and detail editing child views inside the MainLayoutComponent.
 */
export const USERS_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: '' },
    loadComponent: () => import('../pages/list/list.component').then(m => m.UserListComponent),
  },
  {
    path: 'new',
    canDeactivate: [formEditableGuard],
    data: { breadcrumb: 'Nuevo usuario' },
    loadComponent: () => import('../pages/save/save.component').then(m => m.UserSaveComponent)
  },
  {
    path: 'edit/:id',
    canDeactivate: [formEditableGuard],
    data: { breadcrumb: 'Editar usuario' },
    loadComponent: () => import('../pages/save/save.component').then(m => m.UserSaveComponent)
  }
];