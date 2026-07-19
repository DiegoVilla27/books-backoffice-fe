import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';
import { ToastService } from '@core/services/toast.service';
import { CreateBookRequest, UpdateBookRequest } from '@modules/admin/pages/books/interfaces';
import { BooksService } from '@modules/admin/pages/books/services/books.service';
import { UsersService } from '@modules/admin/pages/users/services/users.service';
import { InputComponent } from '@shared/components/ui/input/input.component';
import { SelectComponent, SelectOption } from "@shared/components/ui/select/select.component";
import { finalize } from 'rxjs';
import { bookValidations } from './validations';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';

/**
 * Controller component for both creating new and editing existing Book records.
 *
 * @remarks
 * Queries active users to support owner assignment selection dropdown options.
 * Handles validation bounds and API dispatch pipelines.
 */
@Component({
  selector: 'app-book-save',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    SelectComponent,
    PageHeaderComponent
  ],
  templateUrl: './save.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookSaveComponent implements OnInit {
  /** Mode toggle flag representing if editing an existing record or creating a new one. */
  isEditMode = signal<boolean>(false);
  /** Track if initial profile payloads are resolving over the network layer. */
  isInitialLoading = signal<boolean>(false);
  /** The target identifier of the book record under edit mode. */
  private bookId = signal<number | null>(null);
  /** Loading/submitting flag to throttle double submissions. */
  isSubmitting = signal<boolean>(false);
  /** Reactive form instance containing book details controls. */
  bookForm!: FormGroup;
  /** Dropdown select option list containing registered users. */
  users = signal<SelectOption[]>([]);

  readonly routeBooks: string = ROUTES_MAPPING.admin.books.root;

  /** Validation message mappings used in the form layout. */
  validations = bookValidations;

  /** FormBuilder helper reference to construct reactive form validation trees. */
  private fb = inject(FormBuilder);
  /** ActivatedRoute reference to query parameters in edit view modes. */
  private route = inject(ActivatedRoute);
  /** Angular Router reference for redirection. */
  private router = inject(Router);
  /** Injected Users service CRUD helper. */
  private usersSvc = inject(UsersService);
  /** Injected Books service CRUD helper. */
  private booksSvc = inject(BooksService);
  /** Core toast notification engine. */
  private toast = inject(ToastService);

  constructor() {
    this.initForm();
  }

  /**
   * Reads route configuration parameters on view entry to initialize Edit component mode states.
   */
  ngOnInit(): void {
    this.loadUsers();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode.set(true);
      this.isInitialLoading.set(true);
      this.bookId.set(parseInt(idParam, 10));
      this.loadBookData(this.bookId()!);
    }
  }

  /**
   * Instantiates form control values and validation bounds.
   */
  private initForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      userId: ['', Validators.required]
    });
  }

  /**
   * Fetches users to populate the owner selector dropdown.
   */
  private loadUsers() {
    this.usersSvc.getLookup().subscribe((users) => {
      this.users.set(users.map((user) => ({
        value: user.id,
        label: `${user.name} ${user.lastname}`
      })));
    });
  }

  /**
   * Pre-loads an existing book data into form controls.
   *
   * @param id - Target book identifier.
   */
  private loadBookData(id: number): void {
    this.booksSvc.getById(id)
      .pipe(finalize(() => this.isInitialLoading.set(false)))
      .subscribe({
        next: ({ title, author, user }) => {
          this.bookForm.patchValue({
            title: title,
            author: author,
            userId: user.id
          });
        },
        error: () => {
          this.toast.error('No se pudieron recuperar los datos del libro');
          this.router.navigateByUrl(this.routeBooks);
        }
      });
  }

  /**
   * Form submit handler. Orchestrates validation checks and calls create/update APIs.
   */
  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.bookForm.value;

    this.isEditMode() ? this.updateBook({ ...payload, userId: Number(payload.userId) })
      : this.createBook({ ...payload, userId: Number(payload.userId) });
  }

  /**
   * Dispatches an asynchronous transaction to provision and persist a new book record 
   * within the identity ecosystem.
   * 
   * @param payload - Strict data structural payload schema representing the new book context constraints.
   */
  private createBook(payload: CreateBookRequest): void {
    this.booksSvc.create(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe(this.handleResponse());
  }

  /**
   * Dispatches an asynchronous mutation request to synchronize structural profile modifications.
   * Sanitizes empty password entries prior to serialization over the wire network layer.
   * 
   * @param payload - The incremental properties mapping patch mutations onto the target book entity.
   */
  private updateBook(payload: UpdateBookRequest): void {
    this.booksSvc.update(this.bookId()!, payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe(this.handleResponse());
  }

  /**
   * A Higher-Order function factory that initializes localized, standard lifecycle 
   * Subscriber Observers to manage operational success or system exception behaviors.
   * Alleviates double-submitting locks, invokes viewport navigation routing, and triggers toast notifications.
   * 
   * @returns A structured dynamic Observer object mapping standard `next` and `error` transactional hooks.
   */
  private handleResponse(): {
    next: () => void;
    error: () => void;
  } {
    return {
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl(this.routeBooks);
        this.toast.success(`Libro ${this.isEditMode() ? 'actualizado' : 'creado'} correctamente`);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error(`Error al ${this.isEditMode() ? 'actualizar' : 'crear'} el libro`);
      }
    };
  }
}