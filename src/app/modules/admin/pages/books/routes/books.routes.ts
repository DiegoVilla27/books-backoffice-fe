// src/app/modules/books/routes/books.routes.ts
import { Routes } from '@angular/router';
import { formEditableGuard } from '@core/guards/form-editable.guard';

/**
 * Route configurations for the Books module.
 * Wraps list, creation, and editing components under the common MainLayoutComponent.
 */
export const BOOKS_ROUTES: Routes = [

  {
    path: '',
    data: { breadcrumb: '' },
    loadComponent: () => import('../pages/list/list.component').then(m => m.BookListComponent)
  },
  {
    path: 'new',
    canDeactivate: [formEditableGuard],
    data: { breadcrumb: 'Nuevo libro' },
    loadComponent: () => import('../pages/save/save.component').then(m => m.BookSaveComponent)
  },
  {
    path: 'edit/:id',
    canDeactivate: [formEditableGuard],
    data: { breadcrumb: 'Editar libro' },
    loadComponent: () => import('../pages/save/save.component').then(m => m.BookSaveComponent)
  }
];