import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Pagination, PaginationRequest } from '@core/interfaces/pagination';
import { Log } from '../interfaces';

/**
 * Service managing System Audit Logs simulation data transactions.
 */
@Injectable({
  providedIn: 'root'
})
export class LogsService {
  /** Mock dataset containing audit log events. */
  private mockLogs: Log[] = [
    {
      id: 'LOG-001',
      action: 'USER_LOGIN',
      level: 'INFO',
      message: 'Usuario diego@cabuweb.com inició sesión exitosamente.',
      operator: 'Diego Villa',
      ip: '192.168.1.15',
      timestamp: '2026-07-16T16:45:00Z'
    },
    {
      id: 'LOG-002',
      action: 'BOOK_CREATE',
      level: 'INFO',
      message: 'Libro "Angular Essentials" registrado en el catálogo.',
      operator: 'Diego Villa',
      ip: '192.168.1.15',
      timestamp: '2026-07-16T16:46:12Z'
    },
    {
      id: 'LOG-003',
      action: 'BOOK_DELETE',
      level: 'WARN',
      message: 'Intento de eliminación física del libro ID: 45 por no administrador.',
      operator: 'Juan Pérez',
      ip: '192.168.1.20',
      timestamp: '2026-07-16T16:48:30Z'
    },
    {
      id: 'LOG-004',
      action: 'TOKEN_REFRESH',
      level: 'INFO',
      message: 'Rotación silenciosa de Refresh Token completada para el cliente.',
      operator: 'diego@cabuweb.com',
      ip: '192.168.1.15',
      timestamp: '2026-07-16T16:50:00Z'
    },
    {
      id: 'LOG-005',
      action: 'DATABASE_ERROR',
      level: 'ERROR',
      message: 'Fallo crítico de conexión con PostgreSQL: Timeout excedido.',
      operator: 'SYSTEM',
      ip: '127.0.0.1',
      timestamp: '2026-07-16T16:51:15Z'
    },
    {
      id: 'LOG-006',
      action: 'USER_REGISTER',
      level: 'INFO',
      message: 'Nuevo usuario registrado: admin@cabuweb.com con rol ADMIN.',
      operator: 'Diego Villa',
      ip: '192.168.1.15',
      timestamp: '2026-07-16T16:53:10Z'
    },
    {
      id: 'LOG-007',
      action: 'USER_UPDATE',
      level: 'INFO',
      message: 'Actualización parcial de campos de perfil para el usuario ID: 10.',
      operator: 'admin@cabuweb.com',
      ip: '192.168.1.18',
      timestamp: '2026-07-16T16:55:00Z'
    },
    {
      id: 'LOG-008',
      action: 'UNAUTHORIZED_ACCESS',
      level: 'WARN',
      message: 'Acceso denegado a la ruta administrativa /users/lookup.',
      operator: 'Juan Pérez',
      ip: '192.168.1.20',
      timestamp: '2026-07-16T17:00:22Z'
    },
    {
      id: 'LOG-009',
      action: 'BOOK_UPDATE',
      level: 'INFO',
      message: 'Campos de metadatos modificados para el libro "Clean Architecture".',
      operator: 'admin@cabuweb.com',
      ip: '192.168.1.18',
      timestamp: '2026-07-16T17:02:11Z'
    },
    {
      id: 'LOG-010',
      action: 'API_TIMEOUT',
      level: 'WARN',
      message: 'Petición GET /api/v1/users demoró más de 5000ms en responder.',
      operator: 'SYSTEM',
      ip: '127.0.0.1',
      timestamp: '2026-07-16T17:05:40Z'
    },
    {
      id: 'LOG-011',
      action: 'USER_LOGIN',
      level: 'INFO',
      message: 'Usuario juan.perez@cabuweb.com inició sesión exitosamente.',
      operator: 'Juan Pérez',
      ip: '192.168.1.20',
      timestamp: '2026-07-16T17:10:00Z'
    },
    {
      id: 'LOG-012',
      action: 'CORS_REJECTION',
      level: 'ERROR',
      message: 'Petición HTTP bloqueada por directiva CORS desde origen desconocido.',
      operator: 'SYSTEM',
      ip: '203.0.113.50',
      timestamp: '2026-07-16T17:12:15Z'
    }
  ];

  /**
   * Retrieves a paginated list of system logs matching constraints.
   * Simulates network latency (300ms delay).
   * 
   * @param payload - Pagination parameters.
   * @param filters - Search filters mapping level and search text.
   * @returns Observable stream containing the paginated log records.
   */
  getAll(
    payload: PaginationRequest,
    filters?: { searchTerm?: string; level?: string }
  ): Observable<Pagination<Log>> {
    // 1. Filtrado lógico inicial
    let filtered = [...this.mockLogs];

    if (filters?.level && filters.level !== 'ALL') {
      filtered = filtered.filter(l => l.level === filters.level);
    }

    if (filters?.searchTerm) {
      const query = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        l.message.toLowerCase().includes(query) ||
        l.action.toLowerCase().includes(query) ||
        l.operator.toLowerCase().includes(query) ||
        l.id.toLowerCase().includes(query)
      );
    }

    // 2. Ordenación por fecha descendente (más recientes primero)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 3. Paginación
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / payload.limit));
    const startOffset = (payload.page - 1) * payload.limit;
    const endOffset = startOffset + payload.limit;
    const paginatedItems = filtered.slice(startOffset, endOffset);

    const response: Pagination<Log> = {
      data: paginatedItems,
      pagination: {
        totalItems,
        totalPages,
        currentPage: payload.page,
        limit: payload.limit
      }
    };

    return of(response).pipe(delay(300));
  }
}
