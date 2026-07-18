import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { clearCache, getCacheSnapshot, invalidateCache } from '@core/cache';

/**
 * Debugging developer overlay console displaying active runtime query cache entries.
 *
 * @remarks
 * Uses zone-coalescing loops running outside the standard Angular zone context.
 * Periodically polls the global cache map, waking the Angular change detector
 * only when changes are detected or the dashboard overlay is active.
 */
@Component({
  selector: 'app-cache-devtools',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 left-4 z-50 font-mono text-xs">
      <!-- Botón flotante para abrir/cerrar -->
      <button 
        (click)="isOpen.set(!isOpen())"
        class="bg-purple-600 hover:bg-purple-700 text-zinc-100 px-4 py-2 rounded-xl shadow-2xl font-semibold tracking-wide border border-purple-500/30 transition-all active:scale-95"
      >
        {{ isOpen() ? '✕ Cerrar DevTools' : '⚡ Cache DevTools (' + cacheSize() + ')' }}
      </button>

      <!-- Panel Principal -->
      @if (isOpen()) {
        <div class="w-[550px] max-h-[500px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl mt-3 flex flex-col overflow-hidden backdrop-blur-md bg-opacity-95">
          
          <!-- Encabezado -->
          <div class="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <h3 class="text-zinc-200 font-bold tracking-tight text-sm flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
              Estado del Almacenamiento (Caché)
            </h3>
            <button 
              (click)="onClearAll()"
              class="text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 bg-zinc-950 px-2 py-1 rounded-lg transition-colors"
            >
              Vaciar Caché
            </button>
          </div>

          <!-- Listado de Consultas -->
          <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            @if (cacheEntries().length === 0) {
              <div class="text-zinc-600 text-center py-8 italic border border-dashed border-zinc-900 rounded-xl">
                Caché totalmente vacía. Dispara alguna petición HTTP...
              </div>
            }

            @for (entry of cacheEntries(); track entry.key) {
              <div class="border border-zinc-900 rounded-xl bg-zinc-900/20 p-3 flex flex-col gap-2 transition-all hover:border-zinc-800">
                
                <!-- Barra de Estado de la Consulta -->
                <div class="flex justify-between items-start gap-2">
                  <div class="flex flex-col gap-1 max-w-[75%]">
                    <span class="text-purple-400 font-semibold break-all text-[11px] leading-tight">
                      {{ entry.key }}
                    </span>
                    <div class="flex flex-wrap gap-1.5 mt-1">
                      <!-- Etiquetas (Badges) de estado -->
                      @if (entry.expired) {
                        <span class="px-1.5 py-0.5 rounded bg-red-950 border border-red-800/30 text-red-400 text-[9px] uppercase font-bold">Expirado</span>
                      } @else {
                        <span class="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/30 text-emerald-400 text-[9px] uppercase font-bold">Fresco</span>
                      }
                      
                      @if (entry.hasObservable) {
                        <span class="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800/30 text-blue-400 text-[9px] uppercase font-bold animate-pulse">En curso 📡</span>
                      }
                    </div>
                  </div>
                  
                  <button 
                    (click)="onInvalidate(entry.key)"
                    class="text-[10px] text-zinc-500 hover:text-red-400 px-2 py-0.5 rounded border border-zinc-900 hover:border-red-900 transition-colors shrink-0"
                  >
                    Invalidar
                  </button>
                </div>

                <!-- Formato Estético del JSON -->
                <div class="mt-1 bg-zinc-950 p-2.5 rounded-lg border border-zinc-900/60 max-h-[150px] overflow-auto">
                  <pre class="text-[10px] text-zinc-400 leading-normal selection:bg-purple-500/30"><code [innerHTML]="syntaxHighlight(entry.data)"></code></pre>
                </div>
                
                <!-- Información de tiempos -->
                <div class="text-[9px] text-zinc-600 flex justify-between px-0.5">
                  <span>Guardado hace: {{ getAge(entry.timestamp) }}s</span>
                  <span>Tiempo de vida (TTL): {{ entry.ttl / 1000 }}s</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CacheDevToolsComponent implements OnInit, OnDestroy {
  /** Active visibility state of the floating developer overlay console. */
  isOpen = signal<boolean>(false);
  /** Dynamic lists of active caching keys and states. */
  cacheEntries = signal<any[]>([]);
  /** Size count of stored cache keys. */
  cacheSize = signal<number>(0);
  /** Captured interval ID reference. */
  private intervalId: any;

  /** Injected Angular NgZone helper utility. */
  private ngZone = inject(NgZone);

  /**
   * Initializes the polling loops running outside of Angular to safeguard performance.
   */
  ngOnInit(): void {
    let ultimoTamanoConocido = 0;

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        // 1. Tomamos la foto de la caché en segundo plano (0% uso de Angular)
        const snapshot = getCacheSnapshot();
        const tamanoActual = snapshot.length;

        // 2. ¿Vale la pena despertar a Angular? 
        // SÓLO lo despertamos si las DevTools están abiertas (para ver los JSONs)
        // O si entró/salió una petición nueva (para actualizar el contador del botón)
        const panelAbierto = this.isOpen();
        const huboCambios = tamanoActual !== ultimoTamanoConocido;

        if (panelAbierto || huboCambios) {
          // Guardamos el tamaño para la siguiente iteración
          ultimoTamanoConocido = tamanoActual;

          // 🚀 Despertamos a Angular con precisión quirúrgica
          this.ngZone.run(() => {
            this.cacheEntries.set(snapshot);
            this.cacheSize.set(tamanoActual);
          });
        }
      }, 1000);
    });
  }

  /**
   * Dismisses polling loop timers.
   */
  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  /**
   * Deactivates cache items matching the targeted keys.
   *
   * @param key - Target namespace string.
   */
  onInvalidate(key: string): void {
    invalidateCache([key]);
    this.cacheEntries.set(getCacheSnapshot());
  }

  /**
   * Resets all stored cache items.
   */
  onClearAll(): void {
    clearCache();
    this.cacheEntries.set([]);
  }

  /**
   * Computes age delta seconds of a cache timestamp.
   *
   * @param timestamp - Numeric epoch millisecond stamp.
   * @returns Unwrapped decimal representation string.
   */
  getAge(timestamp: number): string {
    return ((Date.now() - timestamp) / 1000).toFixed(1);
  }

  /**
   * Prettifies JSON objects by wrapping target data properties in styled spans.
   *
   * @param json - Raw object data configuration parameters.
   * @returns Styled and escaped HTML string template representation.
   */
  syntaxHighlight(json: any): string {
    if (!json) return 'null';
    if (typeof json !== 'object') json = JSON.parse(json);

    let str = JSON.stringify(json, null, 2);

    // Escapar caracteres HTML básicos
    str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Expresión regular para colorear propiedades, strings, números y booleanos en el JSON
    return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = 'text-amber-500'; // Por defecto: Números
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-zinc-500 font-medium'; // Propiedades (Keys)
        } else {
          cls = 'text-teal-400'; // Cadenas de texto (Strings)
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-400 font-bold'; // Booleanos
      } else if (/null/.test(match)) {
        cls = 'text-red-400 italic'; // Nulos (Nulls)
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }
}