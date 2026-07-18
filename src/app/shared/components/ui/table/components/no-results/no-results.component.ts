import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-results',
  standalone: true,
  imports: [],
  template: `
  <tr>
    <td [attr.colspan]="colspan" class="px-6 py-12 text-center">
      <div class="flex flex-col items-center justify-center gap-2">
        <svg
          class="h-8 w-8 text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
        <p class="text-sm font-medium text-zinc-400">
          No se encontraron {{ entity }}
        </p>
        <p class="text-xs text-zinc-600">
          Prueba ajustando el término o los filtros de búsqueda.
        </p>
      </div>
    </td>
  </tr>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Presentation component displayed inside tables when no matching data rows exist.
 */
export class NoResultsComponent {
  /** Singular descriptive name of the entity being listed. */
  @Input({ required: true }) entity: string = '';
  /** The colspan quantity count required to span across the entire table row. */
  @Input({ required: true }) colspan: number = 1;
}
