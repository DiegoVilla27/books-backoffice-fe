import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, ContentChildren, QueryList, computed, input, output, signal } from '@angular/core';
import { NoResultsComponent, ActionsDefDirective, CellDefDirective, PaginationComponent } from './';

/**
 * Configuration options representing an individual table column definition.
 */
export interface TableColumn {
  /** The key property path of the data object to retrieve the value from (supports nested notation e.g., 'user.name'). */
  key: string;
  /** Header title label text displayed in the table header. */
  label: string;
  /** Optional Tailwind CSS classes applied style to the entire column cell stack. */
  className?: string;
}

/**
 * Reusable, high-performance table component supporting custom cell templates, action columns, and pagination.
 *
 * @remarks
 * Uses Angular Content Projection and custom template directives (`CellDefDirective`, `ActionsDefDirective`)
 * to allow parent components to dynamically customize specific table columns and row action buttons.
 *
 * @typeParam T - The data object shape which must contain an `id` lookup key property.
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, NoResultsComponent, PaginationComponent],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T extends { id: any }> {
  /** Array list source containing the collection records displayed in the table. */
  data = input.required<T[]>();
  /** Configurations representing column attributes and formatting styles. */
  columns = input.required<TableColumn[]>();
  /** Singular descriptive name of the entity being listed (used for empty placeholders like 'No se encontraron Libros'). */
  entity = input.required<string>();
  /** Flag representing if table loading skeleton placeholders should be rendered. */
  loading = input<boolean>(false);

  /** Current active pagination index page. */
  page = input.required<number>();
  /** Current maximum item limit size configuration. */
  limit = input.required<number>();
  /** Grand total quantity count of active records across all backend pages. */
  totalItems = input.required<number>();
  /** Computed grand total pages quantity count. */
  totalPages = input.required<number>();
  /** Output callback event triggered when paginator buttons are clicked. */
  pageChanged = output<number>();

  /** Child DOM Projected cell template definitions. */
  @ContentChildren(CellDefDirective) cellDefs!: QueryList<CellDefDirective>;
  /** Child DOM Projected row action actions template definition. */
  @ContentChild(ActionsDefDirective) actionsDef?: ActionsDefDirective;

  /**
   * Computed dictionary mapping custom column cell templates by their column name lookup key.
   *
   * @remarks
   * Memorizes custom template definitions to prevent costly lookup scans during change detection cycles.
   */
  cellTemplates = computed(() => {
    const templates: Record<string, any> = {};
    this.cellDefs?.forEach((def) => {
      templates[def.columnName] = def.template;
    });
    return templates;
  });

  /** Computed target actions column cell template reference, returning `null` if not defined. */
  actionsTemplate = computed(() => this.actionsDef?.template || null);

  /** Computed total quantity count of columns required to render clean empty states spanning the entire table width. */
  totalColumnsCount = computed(() => {
    return this.columns().length + (this.actionsTemplate() ? 1 : 0);
  });

  /**
   * Helper utility that extracts nested property values from records safely.
   *
   * @param item - Target object record.
   * @param path - Key path string (supports dots notation e.g., 'user.name').
   * @returns Unwrapped final value or `undefined` if key path evaluation fails.
   *
   * @example
   * ```typescript
   * const val = getNestedValue({ user: { name: 'Diego' } }, 'user.name'); // Returns 'Diego'
   * ```
   */
  getNestedValue(item: any, path: string): any {
    if (!path) return '';
    return path.split('.').reduce((obj, key) => obj?.[key], item);
  }
}