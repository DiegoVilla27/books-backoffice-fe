import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControlStatus, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormEditableComponent } from '@core/interfaces/form-editable';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';
import { ToastService } from '@core/services/toast.service';
import { EMAIL_RFC5322_STRING } from '@core/validators/email-regex';
import { UniqueEmailValidator } from '@core/validators/unique-email.service';
import { CreateUserRequest, UpdateUserRequest } from '@modules/admin/pages/users/interfaces';
import { UsersService } from '@modules/admin/pages/users/services/users.service';
import { InputComponent } from '@shared/components/ui/input/input.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { SelectComponent, SelectOption } from '@shared/components/ui/select/select.component';
import { Subject } from 'rxjs';
import { userValidations } from './validations';

/**
 * Controller component for both creating new and editing existing User profile records.
 *
 * @remarks
 * Dynamically updates password field validators in edit modes to support leaving it blank.
 * Handles validation bounds and API dispatch pipelines.
 */
@Component({
  selector: 'app-users-save',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    PageHeaderComponent
  ],
  templateUrl: './save.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSaveComponent implements FormEditableComponent {
  /** Mode toggle flag representing if editing an existing record or creating a new one. */
  isEditMode = signal<boolean>(false);
  /** Track if initial profile payloads are resolving over the network layer. */
  isInitialLoading = signal<boolean>(false);
  /** Async validator loading state. */
  loadingEmail = signal<boolean>(false);
  /** Stores the last validated email value to prevent duplicate network dispatches. */
  private lastValidatedEmail: string = '';
  /** The target identifier of the user record under edit mode. */
  private userId = signal<number | null>(null);
  /** Loading/submitting flag to throttle double submissions. */
  isSubmitting = signal<boolean>(false);
  /** Reactive form instance containing user profile details. */
  userForm!: FormGroup;

  readonly routeUsers: string = ROUTES_MAPPING.admin.users.root;

  /** Configured select options list mapping user roles key values. */
  roleOptions: SelectOption[] = [
    { label: 'Usuario Estándar (USER)', value: 'USER' },
    { label: 'Administrador Global (ADMIN)', value: 'ADMIN' }
  ];

  /** Validation message mappings used in the form layout. */
  validations = userValidations;

  /** Subject to trigger email blur event   */
  private emailBlur$ = new Subject<void>();

  /** FormBuilder helper reference to construct reactive form validation trees. */
  private fb = inject(FormBuilder);
  /** ActivatedRoute reference to query parameters in edit view modes. */
  private route = inject(ActivatedRoute);
  /** Angular Router reference for view transitions. */
  private router = inject(Router);
  /** Angular Location service reference. */
  readonly location = inject(Location);
  /** Injected Users service CRUD helper. */
  private usersSvc = inject(UsersService);
  /** Core toast notification engine. */
  private toast = inject(ToastService);
  /** Factory function returning an async validator triggered on blur lifecycle operations. */
  private emailValidator = inject(UniqueEmailValidator);

  constructor() {
    this.initForm();
  }

  /**
   * Reads route configuration parameters on view entry to initialize Edit component mode states.
   */
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode.set(true);
      this.isInitialLoading.set(true);
      this.userId.set(parseInt(idParam, 10));
      this.loadUserData(this.userId()!);
    }
  }

  /**
   * Instantiates form control values and validation bounds.
   */
  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern(EMAIL_RFC5322_STRING)
          ],
          asyncValidators: [this.emailValidator.create(this.emailBlur$)]
        }
      ],
      password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      age: [null, [Validators.required, Validators.min(18), Validators.max(100)]],
      role: ['USER', [Validators.required]],
      isActive: [true, [Validators.required]]
    });
    this.watchEmail();
  }

  /**
   * Initializes a structural lifecycle monitor targeting the email form control's asynchronous operational states.
   * Listens to internal status mutation streams to toggle layout processing feedback flags.
   * 
   * @remarks
   * This orchestration method directly tracks the reactive `statusChanges` engine stream. 
   * When an asynchronous validator is dispatched over the wire, Angular automatically shifts the 
   * control's validation state into a `'PENDING'` status context. 
   * As soon as the downstream network pipeline evaluates and resolves (emitting either `VALID` or `INVALID`), 
   * this handler intercepts the resolution hook to switch off the concurrent `loadingEmail` stateful signal, 
   * ensuring precise synchronization between the network transport layer and the viewport layout.
   * 
   * @returns void
   */
  watchEmail(): void {
    if (this.isEditMode()) return;

    this.userForm
      .get("email")!
      .statusChanges
      .subscribe((status: FormControlStatus) => {
        if (status !== 'PENDING') {
          this.loadingEmail.set(false);
        }
      });
  }

  /**
   * Pre-loads an existing user profile data into form controls and overrides password validations.
   *
   * @param id - Target user identifier.
   */
  private loadUserData(id: number): void {
    this.usersSvc.getById(id).subscribe({
      next: (user) => {
        // 1. Cargamos los datos del usuario en el formulario
        this.userForm.patchValue(user);

        // 2. Obtenemos la referencia al control del password
        const passwordControl = this.userForm.get('password');

        if (passwordControl) {
          // 3. Le asignamos los nuevos validadores EXCLUYENDO el 'required'
          passwordControl.setValidators([Validators.minLength(3), Validators.maxLength(20)]);
          // 4. ¡Crucial! Le ordenamos a Angular que recalcule el estado de validez del campo
          passwordControl.updateValueAndValidity();
        }

        // 5. Obtenemos la referencia al control del email
        const emailControl = this.userForm.get('email');

        if (emailControl) {
          emailControl.disable();
          // 3. Le asignamos limpiamos los validadores
          emailControl.setValidators([]);
          emailControl.setAsyncValidators([]);
          // 4. ¡Crucial! Le ordenamos a Angular que recalcule el estado de validez del campo
          emailControl.updateValueAndValidity();
        }

        this.isInitialLoading.set(false);
      },
      error: () => {
        this.isInitialLoading.set(false);
        this.toast.error('No se pudieron recuperar los datos del usuario');
        this.router.navigateByUrl(this.routeUsers);
      }
    });
  }

  /**
   * Orchestrates the form submission lifecycle by validating control trees and 
   * dispatching the synchronized payload data into the corresponding persistence pipeline.
   * Marks all internal form tree nodes as touched to trigger layout validation feedback on failure.
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.userForm.markAsPristine();
    this.isSubmitting.set(true);
    const payload = this.userForm.value;

    this.isEditMode() ? this.updateUser(payload) : this.createUser(payload);
  }

  /**
   * Dispatches an asynchronous transaction to provision and persist a new user record 
   * within the identity ecosystem.
   * 
   * @param payload - Strict data structural payload schema representing the new user context constraints.
   */
  private createUser(payload: CreateUserRequest): void {
    this.usersSvc.create(payload).subscribe(this.handleResponse());
  }

  /**
   * Dispatches an asynchronous mutation request to synchronize structural profile modifications.
   * Sanitizes empty password entries prior to serialization over the wire network layer.
   * 
   * @param payload - The incremental properties mapping patch mutations onto the target user entity.
   */
  private updateUser(payload: UpdateUserRequest): void {
    if (payload.password === "") delete payload.password;

    this.usersSvc.update(this.userId()!, payload).subscribe(this.handleResponse());
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
        this.router.navigateByUrl(this.routeUsers);
        this.toast.success(`Usuario ${this.isEditMode() ? 'actualizado' : 'creado'} correctamente`);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error(`Error al ${this.isEditMode() ? 'actualizar' : 'crear'} el usuario`);
      }
    };
  }

  /**
   * Stateful execution boundary and interceptor for the asynchronous email uniqueness pipeline.
   * Executed exclusively on the focus loss (`blur`) viewport event of the email input field.
   * 
   * @remarks
   * This method introduces a manual verification guard acting as a debounce gate:
   * 1. Short-circuits execution if the current controller string matches the internal snapshot 
   *    of the most recently evaluated value (`lastValidatedEmail`), avoiding redundant network hits.
   * 2. Inspects synchronous validity bounds (`required`, `pattern`) to prevent dispatching malformed 
   *    strings to the underlying database layer.
   * 3. Sets the concurrent stateful loading signal (`loadingEmail`) to true on validation success, 
   *    and feeds the unified data stream event pipeline emitter (`emailBlur$`).
   * 
   * @returns void
   */
  onEmailBlur(): void {
    if (this.isEditMode()) return;

    const emailControl = this.userForm.get('email');
    if (!emailControl) return;

    const currentValue = emailControl.value;

    // 🚀 EL FILTRO: Si el valor es el mismo que ya validamos, no hacemos nada
    if (currentValue === this.lastValidatedEmail) {
      return;
    }

    // Solo si el formato es correcto, marcamos como cargando y actualizamos el último validado
    if (!emailControl.hasError('required') && !emailControl.hasError('pattern')) {
      this.lastValidatedEmail = currentValue; // Guardamos el valor actual
      this.loadingEmail.set(true);
    }

    this.emailBlur$.next();
  }

  /**
   * Evaluates whether the current component state contains unsaved or dirty data modifications.
   *
   * @returns True if the entity state is modified and pending commit, false otherwise.
   */
  isDirty(): boolean {
    return this.userForm.dirty;
  }

  /**
   * Navigates to the previous route in the browser's navigation history.
   */
  goBack(): void {
    this.location.back();
  }
}