import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationRequest } from '@core/interfaces/pagination';
import { NoResultsComponent } from '@shared/components/ui/table/components/no-results/no-results.component';
import { PaginationComponent } from '@shared/components/ui/table/components/pagination/pagination.component';
import { InputComponent } from '@shared/components/ui/input/input.component';
import { Log, LogLevel } from '@modules/admin/pages/logs/interfaces';
import { LogsService } from '@modules/admin/pages/logs/services/logs.service';

/**
 * Controller component for the System Logs directory list view.
 * Handles search queries, status level filtering (ALL/INFO/WARN/ERROR), and loads simulated records.
 */
@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent,
    InputComponent,
    NoResultsComponent
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class LogListComponent implements OnInit {
  /** Array of active audit log records retrieved from mock database service. */
  logs: Log[] = [];
  /** Reactive query string search filter model. */
  searchTerm: string = '';
  /** Active log severity level filter dropdown selection. */
  selectedLevel: 'ALL' | LogLevel = 'ALL';
  /** Indicator state representing async load states. */
  isLoading = false;

  page = signal<number>(1);
  limit = signal<number>(10);
  totalItems = signal<number>(0);
  totalPages = signal<number>(1);

  /** Injected System Logs service. */
  private logsSvc = inject(LogsService);

  /**
   * Initializes the catalog component, calling for initial logs records.
   */
  ngOnInit(): void {
    this.getAll();
  }

  /**
   * Dispatches list directory query to logs service based on active pagination and filter states.
   */
  getAll(): void {
    this.isLoading = true;
    const req: PaginationRequest = {
      page: this.page(),
      limit: this.limit(),
    };

    const filters = {
      searchTerm: this.searchTerm,
      level: this.selectedLevel
    };

    this.logsSvc.getAll(req, filters).subscribe({
      next: (resp) => {
        this.logs = resp.data;
        this.totalItems.set(resp.pagination.totalItems);
        this.totalPages.set(resp.pagination.totalPages);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando logs:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Resets the active page index to 1 and triggers a new query list dispatch. Fired on filter search changes.
   */
  onFilterChange(): void {
    this.page.set(1);
    this.getAll();
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
  }
}
