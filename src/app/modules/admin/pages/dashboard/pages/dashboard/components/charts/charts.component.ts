import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '@modules/admin/pages/dashboard/services/dashboard.service';
import { SelectComponent } from '@shared/components/ui/select/select.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

/**
 * @description
 * Componente de visualización analítica encargado de renderizar gráficos comparativos bidimensionales
 * del histórico operativo de la plataforma (volumen de registros de libros y usuarios).
 * 
 * Integra un flujo reactivo basado en Angular Signals, internacionalización nativa mediante `Intl`
 * y una capa defensiva de interfaz para neutralizar excepciones de renderizado del motor SVG de D3.
 * 
 * @usageNotes
 * Se inyecta directamente como un nodo standalone dentro del contenedor del Backoffice Administrativo.
 * Requiere la presencia de un proveedor activo de animaciones (`provideAnimations()`) a nivel global.
 */
@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, SelectComponent, FormsModule],
  template: `
    <div class="w-full rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-xl relative overflow-hidden mb-4">
      <!-- Loader superpuesto (Evita destruir el gráfico y previene los errores de D3) -->
      @if (dashboardSvc.loadingHistory()) {
        <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in">
          <span class="text-sm font-mono text-zinc-400">Cargando telemetría...</span>
        </div>
      }

      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-semibold text-zinc-100">Historial de Crecimiento</h3>
          <p class="text-xs text-zinc-500">Métricas de registros distribuidas por mes</p>
        </div>
        
        <div class="flex items-center gap-6">
          <!-- Leyenda Custom Premium -->
          <div class="flex items-center gap-4 text-xs font-semibold">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-[#10b981]"></span>
              <span class="text-zinc-400">Libros</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-[#a855f7]"></span>
              <span class="text-zinc-400">Usuarios</span>
            </div>
          </div>

          <div class="w-full md:w-32">
            <app-select
              [ngModel]="selectedYear()"
              (ngModelChange)="onYearSelectedChange($event)"
              [options]="years"
              [placeholder]="'Año'"
            />
          </div>
        </div>
      </div>

      <div class="h-80 w-full selection:bg-transparent">
        <ngx-charts-bar-vertical-2d
          [results]="translatedChartData()"
          [scheme]="customColorScheme"
          [animations]="false"
          [xAxis]="true"
          [yAxis]="!isHistoryAllZeros()"
          [showXAxisLabel]="false"
          [showYAxisLabel]="false"
          [gradient]="true"
          [barPadding]="4"
          [groupPadding]="12"
          [tooltipDisabled]="true"
          [showDataLabel]="!isHistoryAllZeros()"
        >
        </ngx-charts-bar-vertical-2d>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartsComponent {
  /**
   * Instancia inyectada del servicio de agregación de datos operativos del dashboard.
   * Provee acceso a los estados globales de lectura y flags de carga del historial.
   */
  public readonly dashboardSvc = inject(DashboardService);

  /**
   * Estado reactivo primario que gestiona la frontera cronológica del año bajo análisis.
   * Se inicializa de forma dinámica con el año en curso del sistema.
   */
  readonly selectedYear = signal<number>(new Date().getFullYear());

  /**
   * Catálogo de opciones de filtrado temporal admitidas por el control de selección.
   */
  readonly years = [
    { value: 2025, label: '2025' },
    { value: 2026, label: '2026' }
  ];

  /**
   * Matriz de especificación cromática de Ngx-Charts configurada en consonancia
   * con la paleta visual oscura (`zinc-950`) del Dashboard principal.
   */
  readonly customColorScheme = {
    name: 'customDark',
    selectable: true,
    group: 'Ordinal' as any,
    domain: ['#10b981', '#a855f7']
  };

  /**
   * Estado calculado que determina si todas las métricas de la serie temporal evaluada son nulas.
   * 
   * @remarks
   * Se utiliza como salvaguarda crítica para mutar las propiedades `yAxis` y `showDataLabel` 
   * a valores falsos si no existen datos mapeados, anulando así comportamientos asimétricos 
   * o superposiciones visuales no deseadas en el lienzo de Ngx-Charts.
   */
  readonly isHistoryAllZeros = computed(() => {
    const data = this.dashboardSvc.history();
    if (!data || data.length === 0) return true;
    return data.every((item: any) =>
      (item.records || []).every((rec: any) => Number(rec.value || 0) === 0)
    );
  });

  /**
   * Constructor de la clase. Estructura el disparador reactivo principal.
   */
  constructor() {
    /**
     * Efecto reactivo encargado de sincronizar el estado del selector local con la capa de persistencia.
     * Reacciona de manera automática ante mutaciones del Signal {@link selectedYear}.
     */
    effect(() => {
      this.dashboardSvc.getHistory(this.selectedYear());
    });
  }

  /**
   * Flujo de transformación reactivo (`computed`) que adapta el DTO de telemetría del backend
   * al contrato estructural multilinea (`MultiSeries`) demandado por Ngx-Charts.
   * 
   * @remarks
   * Implementa una capa cosmética avanzada que convierte identificadores numéricos de mes ("01", "02")
   * a strings abreviados localizados (i18n) dependientes del locale del agente de usuario.
   * Aplica además tipado numérico forzado en la lectura para blindar al motor de trazado SVG contra errores `attrTween`.
   * 
   * @returns Un array estructurado listo para la inyección directa en el canal `[results]` del gráfico.
   */
  readonly translatedChartData = computed(() => {
    const data = this.dashboardSvc.history();
    if (!data || data.length === 0) return [];

    const currentLocale = navigator.language || 'es-ES';
    const monthFormatter = new Intl.DateTimeFormat(currentLocale, { month: 'short' });

    return data.map((item: any) => {
      if (!item || !item.month) {
        return { name: '', series: [] };
      }

      const monthNum = parseInt(item.month, 10);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return { name: '?', series: [] };
      }

      // Constructor numérico seguro que evita RangeError en cualquier navegador
      const dummyDate = new Date(2026, monthNum - 1, 15);
      let formattedMonth = monthFormatter.format(dummyDate).replace('.', '');
      formattedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

      return {
        name: formattedMonth,
        series: (item.records || []).map((rec: any) => ({
          name: rec.name || '',
          value: Number(rec.value || 0)
        }))
      };
    });
  });

  /**
   * Intercepta las notificaciones de cambio emanadas por la directiva del select y actualiza
   * el estado interno del componente de manera tipada.
   * 
   * @param year - El número representativo del año seleccionado por el operario.
   */
  onYearSelectedChange(year: number): void {
    if (year) {
      this.selectedYear.set(Number(year));
    }
  }
}