import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { DashboardStats, RecentActivity } from '../interfaces';

/**
 * Service managing Dashboard statistics and events mock data.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  /** Mock dataset mapping metric stats. */
  private mockStats: DashboardStats = {
    totalUsers: 142,
    totalBooks: 489,
    activeLoans: 68,
    systemHealth: 'EXCELLENT'
  };

  /** Mock dataset listing recent activity events. */
  private mockActivities: RecentActivity[] = [
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

  /**
   * Retrieves summary metric stats.
   * Simulates network latency (250ms delay).
   * 
   * @returns Observable stream containing the dashboard metrics.
   */
  getStats(): Observable<DashboardStats> {
    return of(this.mockStats).pipe(delay(250));
  }

  /**
   * Retrieves a collection of recent system activities.
   * Simulates network latency (250ms delay).
   * 
   * @returns Observable stream containing the recent activities.
   */
  getRecentActivities(): Observable<RecentActivity[]> {
    return of(this.mockActivities).pipe(delay(250));
  }
}
