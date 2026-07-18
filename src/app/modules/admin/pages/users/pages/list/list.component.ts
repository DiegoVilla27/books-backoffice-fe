import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { invalidateCache, KEY_QUERIES } from '@core/cache';
import { AutoDestroyBase } from '@core/classes/auto-destroy';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';
import { ToastService } from '@core/services/toast.service';
import { User } from '@modules/admin/pages/users/interfaces';
import { UsersService } from '@modules/admin/pages/users/services/users.service';
import { PageHeaderComponent } from "@shared/components/ui/page-header/page-header.component";
import { SelectOption } from '@shared/components/ui/select/select.component';
import { ActionsDefDirective, CellDefDirective, TableColumn, TableComponent } from '@shared/components/ui/table';
import { BehaviorSubject, combineLatest, merge, skip, switchMap, tap } from 'rxjs';
import { UsersFiltersComponent } from './components/filters/filters.component';

/**
 * Component controller for the Users Directory page view.
 *
 * @remarks
 * Coordinates multi-criteria search filters, user role constraints, active/inactive statuses,
 * and paginations. Integrates user soft deactivation triggers and reactive cache invalidation.
 */
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UsersFiltersComponent,
    TableComponent,
    CellDefDirective,
    ActionsDefDirective,
    PageHeaderComponent
  ],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent extends AutoDestroyBase {
  /** Reactive list signal storing current page user profile records fetched from backend API. */
  users = signal<User[]>([]);
  /** Flag representing if the table is currently loading data. */
  isLoading = signal<boolean>(true);
  /** Debounced search query term used to invoke the api search calls safely. */
  searchTerm = signal<string>('');
  /** Select options list mapping user role categories. */
  roles = signal<SelectOption[]>([
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'USER', label: 'Usuario estándar' },
  ]);
  /** Current selected user role filter value. */
  selectedRole = signal<'ADMIN' | 'USER' | ''>('');
  /** Select options list mapping user account activation states. */
  status = signal<SelectOption[]>([
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' },
  ]);
  /** Current selected activation status filter value. */
  selectedStatus = signal<string>('');

  readonly routeNewUser: string = ROUTES_MAPPING.admin.users.new;

  /** Column configuration definitions mapped to the table UI layout. */
  tableColumns: TableColumn[] = [
    { key: 'user', label: 'Usuario' },
    { key: 'age', label: 'Edad' },
    { key: 'role', label: 'Rol' },
    { key: 'booksCount', label: 'Libros' },
    { key: 'isActive', label: 'Estado' },
    { key: 'createdAt', label: 'F. Creación' }
  ];

  /** Current active pagination index page. */
  page = signal<number>(1);
  /** Standard visual maximum records limit count per page. */
  limit = signal<number>(10);
  /** Grand total quantity of registered user profile records. */
  totalItems = signal<number>(0);
  /** Grand total count of pagination pages. */
  totalPages = signal<number>(1);

  /**
   * Computed reactive query parameters payload combining active filters.
   *
   * @remarks
   * Evaluates automatically on pagination shifts, search updates, and dropdown filter modifications.
   */
  readonly queryFilters = computed(() => ({
    page: this.page(),
    limit: this.limit(),
    search: this.searchTerm().trim(),
    role: this.selectedRole(),
    isActive: this.selectedStatus()
  }));

  /** Dynamic BehaviorSubject trigger that forces the stream to refetch backend data on manual events. */
  private refresh$ = new BehaviorSubject<void>(undefined);

  /** Injected Angular Router helper utility. */
  private router = inject(Router);
  /** Injected Users service CRUD helper. */
  private usersSvc = inject(UsersService);
  /** Injected Global toast and notification system. */
  private toast = inject(ToastService);

  constructor() {
    super();
    this.watchFiltersToResetPage();
    this.getAll();
  }

  /**
   * Resets active filter states and clears users query cache.
   */
  resetFilters(): void {
    this.selectedRole.set('');
    this.selectedStatus.set('');
    this.searchTerm.set('');
    this.page.set(1);
    invalidateCache([KEY_QUERIES.USERS, KEY_QUERIES.USERS_LOOKUP]);
  }

  /**
   * Listens to dropdown filter changes to automatically reset current pagination index to 1.
   */
  private watchFiltersToResetPage(): void {
    merge(
      toObservable(this.selectedRole),
      toObservable(this.selectedStatus),
      toObservable(this.searchTerm)
    )
      .pipe(
        skip(3), // Saltamos las emisiones iniciales de inicialización de todas señales
        this.drop() // Auto-destrucción al salir
      )
      .subscribe(() => {
        this.page.set(1);
      });
  }

  /**
   * Configures and runs the core reactive subscription stream that fetches matching users.
   */
  getAll(): void {
    combineLatest([
      toObservable(this.queryFilters),
      this.refresh$
    ]).pipe(
      tap(() => this.isLoading.set(true)),
      switchMap(([filters]) => this.usersSvc.getAll(filters)),
      this.drop()
    ).subscribe({
      next: (resp) => {
        this.users.set(resp.data);
        this.totalItems.set(resp.pagination.totalItems);
        this.totalPages.set(resp.pagination.totalPages);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  /**
   * Navigates the client routing context to the edit profile details page.
   *
   * @param user - Target user profile data object.
   */
  editUser(user: User) {
    this.router.navigateByUrl(ROUTES_MAPPING.admin.users.edit(user.id));
  }

  /**
   * Spawns confirmation dialogs and triggers deactivation/soft-deletion requests to the backend.
   *
   * @param user - Target user profile data object.
   */
  async deleteUser(user: User): Promise<void> {
    const confirmado = await this.toast.confirm(
      'Desactivar Registro',
      `Estás a punto de desactivar el usuario "${user.name} ${user.lastname}". Podrás revertir esta acción más adelante.`
    );

    if (!confirmado) return;

    this.usersSvc.delete(user.id).pipe(this.drop()).subscribe({
      next: () => {
        this.refresh$.next();
        this.toast.success('Usuario desactivado correctamente');
      }
    });
  }
}

