import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';
import { Logs } from '@modules/admin/pages/dashboard/interfaces';
import { StatsComponent } from './components/stats/stats.component';
import { ChartsComponent } from './components/charts/charts.component';

/**
 * @description
 * Componente contenedor de alto nivel encargado de orquestar la vista principal de la consola de administración.
 * 
 * Actúa como punto de montaje centralizado para los subcomponentes de telemetría analítica (gráficos), 
 * agregación de métricas globales (tarjetas estadísticas), listados de auditoría operativa en tiempo real 
 * y el lanzador de accesos rápidos del sistema.
 * 
 * @usageNotes
 * Se utiliza como un nodo de enrutamiento principal dentro del submódulo de administración (`admin`).
 * Utiliza la estrategia de detección de cambios por defecto de Angular, sirviendo como agregador de UI.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatsComponent, ChartsComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  /**
   * Colección reactiva de registros de acciones y trazas operativas auditadas más recientes
   * en la consola del backoffice.
   */
  logs = signal<Logs[]>([]);

  /**
   * Diccionario inmutable que contiene el mapa de rutas canónicas y endpoints de navegación 
   * del ecosistema de la aplicación. Evita el acoplamiento a paths duros en la plantilla HTML.
   */
  readonly routes = ROUTES_MAPPING;

  /**
   * Utilidad de enrutamiento nativa de Angular inyectada para gestionar la navegación programática.
   */
  private router = inject(Router);

  /**
   * Gestiona y despacha redirecciones inmediatas hacia módulos operativos específicos 
   * a través de la interacción del operario con los disparadores del lanzador de accesos rápidos.
   * 
   * @param path - La ruta absoluta mapeada hacia la cual se desea redirigir el flujo de la aplicación.
   */
  navigateQuickAction(path: string): void {
    this.router.navigateByUrl(path);
  }
}