export const ROUTES_MAPPING = {
  // Rutas públicas
  auth: {
    root: 'auth',
    login: '/auth/login',
    register: '/auth/register',
  },

  // Rutas del panel de administración
  admin: {
    root: 'admin',
    dashboard: '/admin/dashboard',

    users: {
      root: '/admin/users',
      new: '/admin/users/new',
      edit: (id: string | number) => `/admin/users/edit/${id}`
    },

    books: {
      root: '/admin/books',
      new: '/admin/books/new',
      edit: (id: string | number) => `/admin/books/edit/${id}`
    },

    logs: {
      root: '/admin/logs'
    }
  }
} as const;
