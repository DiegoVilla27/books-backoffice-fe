import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Paginator controller component displaying numeric pages selection bands and text details.
 *
 * @remarks
 * Uses computed signals to slice visible numeric range windows dynamically (up to 5 pages),
 * preventing costly DOM renders on every change detection cycle.
 */
export class PaginationComponent {
  /** Current active pagination index page. */
  currentPage = input.required<number>();
  /** Standard records page limit counts threshold. Defaults to 10. */
  itemsPerPage = input<number>(10);
  /** Grand total quantity count of database active records. */
  totalItems = input.required<number>();
  /** Computed grand total pages quantity count. */
  totalPages = input.required<number>();

  /** Output event emitted when pagination indexes change. */
  pageChanged = output<number>();

  /**
   * Computed numeric page indexes array representing the visible window range (max 5 visible buttons).
   */
  pagesArray = computed<number[]>(() => {
    const maxVisiblePages = 5;
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    let startPage = Math.max(1, current - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > total) {
      endPage = total;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  });

  /** Computed starting record offset index representation (e.g. 1 in "Showing 1 to 10 of 100"). */
  fromItem = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  });

  /** Computed ending record offset index representation (e.g. 10 in "Showing 1 to 10 of 100"). */
  toItem = computed(() => {
    const currentMax = this.currentPage() * this.itemsPerPage();
    const total = this.totalItems();
    return currentMax > total ? total : currentMax;
  });

  /**
   * Dispatches page change events to parent listener.
   *
   * @param page - Target page index.
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChanged.emit(page);
    }
  }

  /**
   * Advances current page index if not on the final index.
   */
  next(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChanged.emit(this.currentPage() + 1);
    }
  }

  /**
   * Retracts current page index if not on the first index.
   */
  prev(): void {
    if (this.currentPage() > 1) {
      this.pageChanged.emit(this.currentPage() - 1);
    }
  }
}