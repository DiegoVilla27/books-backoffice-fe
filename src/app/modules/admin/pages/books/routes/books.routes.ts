// src/app/modules/books/routes/books.routes.ts
import { Routes } from '@angular/router';

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
    data: { breadcrumb: 'Nuevo libro' },
    loadComponent: () => import('../pages/save/save.component').then(m => m.BookSaveComponent)
  },
  {
    path: 'edit/:id',
    data: { breadcrumb: 'Editar libro' },
    loadComponent: () => import('../pages/save/save.component').then(m => m.BookSaveComponent)
  }
];