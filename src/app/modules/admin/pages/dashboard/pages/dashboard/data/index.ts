import { RecentActivity } from "../../../interfaces";

export const mockActivities: RecentActivity[] = [
  {
    id: 'ACT-001',
    message: 'Diego Villa registró el libro "Angular Solutions".',
    time: 'Hace 5 minutos',
    type: 'BOOK'
  },
  {
    id: 'ACT-002',
    message: 'Rotación automática de Refresh Token completada.',
    time: 'Hace 12 minutos',
    type: 'LOG'
  },
  {
    id: 'ACT-003',
    message: 'Nuevo usuario registrado: admin@cabuweb.com por Admin.',
    time: 'Hace 24 minutos',
    type: 'USER'
  },
  {
    id: 'ACT-004',
    message: 'Intento fallido de eliminación física de libro ID: 45.',
    time: 'Hace 1 hora',
    type: 'LOG'
  },
  {
    id: 'ACT-005',
    message: 'Juan Pérez modificó el título del libro "TypeScript Essentials".',
    time: 'Hace 2 horas',
    type: 'BOOK'
  }
];