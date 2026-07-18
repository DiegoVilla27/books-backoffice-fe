import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { invalidateCache, KEY_QUERIES } from '@core/cache';
import { AutoDestroyBase } from '@core/classes/auto-destroy';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';
import { ToastService } from '@core/services/toast.service';
import { Book } from '@modules/admin/pages/books/interfaces';
import { BooksService } from '@modules/admin/pages/books/services/books.service';
import { UsersService } from '@modules/admin/pages/users/services/users.service';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { SelectOption } from '@shared/components/ui/select/select.component';
import { ActionsDefDirective, CellDefDirective, TableColumn, TableComponent } from '@shared/components/ui/table';
import { BehaviorSubject, combineLatest, merge, skip, switchMap, tap } from 'rxjs';
import { BooksFiltersComponent } from './components/filters/filters.component';

/**
 * Component controller for the Books Catalog listing page dashboard view.
 *
 * @remarks
 * Handles multi-criteria search queries, filter resets, paginations, and record deactivation events
 * by coordinating a declarative RxJS stream combining Angular Signals and a refresh trigger subject.
 */
@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BooksFiltersComponent,
    TableComponent,
    CellDefDirective,
    ActionsDefDirective,
    PageHeaderComponent
  ],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent extends AutoDestroyBase implements OnInit {
  /** Reactive list signal storing current page book records fetched from the backend API. */
  books = signal<Book[]>([]);
  /** Flag representing if the table is currently loading data. */
  isLoading = signal<boolean>(true);
  /** Debounced search query term used to invoke the api search calls safely. */
  searchTerm = signal<string>('');
  /** Select options list mapping users lookup directory records. */
  users = signal<SelectOption[]>([]);
  /** Current selected creator user filter value. */
  selectedUser = signal<string>('');

  readonly routeNewBook: string = ROUTES_MAPPING.admin.books.new;

  /** Column configuration definitions mapped to the table UI layout. */
  tableColumns: TableColumn[] = [
    { key: 'title', label: 'Título e Información' },
    { key: 'author', label: 'Autor' },
    { key: 'user', label: 'Creado por' },
    { key: 'createdAt', label: 'F. Creación' }
  ];

  /** Current active pagination index page. */
  page = signal<number>(1);
  /** Standard visual maximum records limit count per page. */
  limit = signal<number>(10);
  /** Grand total quantity of registered book records. */
  totalItems = signal<number>(0);
  /** Grand total count of pagination pages. */
  totalPages = signal<number>(1);

  /**
   * Computed reactive query parameters payload combining active filters.
   *
   * @remarks
   * Evaluates automatically on pagination shifts, search term updates, and user select dropdown changes.
   */
  readonly queryFilters = computed(() => ({
    page: this.page(),
    limit: this.limit(),
    search: this.searchTerm().trim(),
    userId: this.selectedUser()
  }));

  /** Dynamic BehaviorSubject trigger that forces the stream to refetch backend data on manual events. */
  private refresh$ = new BehaviorSubject<void>(undefined);

  /** Injected Angular Router helper utility. */
  private router = inject(Router);
  /** Injected Books service CRUD controller. */
  private booksSvc = inject(BooksService);
  /** Injected Global toast and notification system. */
  private toast = inject(ToastService);
  /** Injected Users service lookup directory helper. */
  private usersSvc = inject(UsersService);

  constructor() {
    super();
    this.watchFiltersToResetPage();
    this.getAll();
  }

  /**
   * Initializes the catalog component, calling for initial lookup directory lists.
   */
  ngOnInit(): void {
    this.getAllUsers();
  }

  /**
   * Resets active filter states and clears books query cache.
   */
  resetFilters(): void {
    this.selectedUser.set('');
    this.searchTerm.set('');
    this.page.set(1);
    invalidateCache([KEY_QUERIES.BOOKS]);
  }

  /**
   * Listens to dropdown filter changes to automatically reset current pagination index to 1.
   */
  private watchFiltersToResetPage(): void {
    merge(
      toObservable(this.selectedUser),
      toObservable(this.searchTerm)
    )
      .pipe(
        skip(2), // Saltamos las emisiones iniciales de inicialización de ambas señales
        this.drop() // Auto-destrucción al salir
      )
      .subscribe(() => {
        this.page.set(1);
      });
  }

  /**
   * Fetches active user catalog lookup keys.
   */
  getAllUsers(): void {
    this.usersSvc.getLookup().subscribe((resp) => {
      const users: SelectOption[] = resp.map((user) => {
        return {
          value: user.id,
          label: `${user.name} ${user.lastname}`
        }
      })
      this.users.set(users);
    });
  }

  /**
   * Configures and runs the core reactive subscription stream that fetches matching books.
   */
  getAll(): void {
    combineLatest([
      toObservable(this.queryFilters),
      this.refresh$
    ]).pipe(
      tap(() => this.isLoading.set(true)),
      switchMap(([filters]) => this.booksSvc.getAll(filters)),
      this.drop()
    ).subscribe({
      next: (resp) => {
        this.books.set(resp.data);
        this.totalItems.set(resp.pagination.totalItems);
        this.totalPages.set(resp.pagination.totalPages);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  /**
   * Navigates the client routing context to the edit details page.
   *
   * @param book - Target book data object.
   */
  editBook(book: Book): void {
    this.router.navigateByUrl(ROUTES_MAPPING.admin.books.edit(book.id));
  }

  /**
   * Spawns confirmation dialogs and triggers deactivation/deletion requests to the backend.
   *
   * @param book - Target book data object.
   */
  async deleteBook(book: Book): Promise<void> {
    const confirmado = await this.toast.confirm(
      'Eliminar Registro',
      `Estás a punto de eliminar el libro "${book.title}". No podrás revertir esta acción más adelante.`
    );

    if (!confirmado) return;

    this.booksSvc.delete(book.id).pipe(this.drop()).subscribe({
      next: () => {
        this.refresh$.next();
        this.toast.success('Libro eliminado correctamente');
      }
    });
  }
}