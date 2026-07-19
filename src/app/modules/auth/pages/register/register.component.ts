import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputComponent } from '@shared/components/ui/input/input.component';
import { AuthService } from '@modules/auth/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { registerValidations } from './validations';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';

/**
 * Component controller for the Registration page view.
 *
 * @remarks
 * Configures registration form control states and handles validation/submission processes.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputComponent],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  /** FormBuilder helper reference to construct reactive form validation trees. */
  private fb = inject(FormBuilder);
  /** Angular Router reference for post-registration view transitions. */
  private router = inject(Router);
  /** Auth service connection instance for registration HTTP calls. */
  private authSvc = inject(AuthService);
  /** Core toast notification engine. */
  private toast = inject(ToastService);

  /** Reactive form instance mapping user fields. */
  registerForm!: FormGroup;
  /** Active submitting flag indicator to throttle double clicks. */
  isSubmitting = signal<boolean>(false);

  /** Validation message mappings used in the form layout. */
  validations = registerValidations;

  constructor() {
    this.initForm();
  }

  /**
   * Defines form controls, default states, validations rules, and cross-field constraints.
   */
  private initForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      passwordConfirmation: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      age: [null, [Validators.required, Validators.min(1), Validators.max(120)]]
    }, {
      validators: this.passwordMatchValidator // Validador personalizado
    });
  }

  /**
   * Cross-field validator ensuring both password inputs match exactly.
   *
   * @param control - The target abstract control containing the fields to compare.
   * @returns Validation errors map if passwords don't match, or `null` otherwise.
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmation = control.get('passwordConfirmation');

    if (password && confirmation && password.value !== confirmation.value) {
      confirmation.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Form submit handler. Validates input state, triggers loader flags, and requests backend registration.
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.registerForm.value;

    console.log('Enviando registro a la API ->', payload);

    this.authSvc.register(payload).subscribe({
      next: (_) => {
        this.isSubmitting.set(false);
        console.log('¡Registo exitoso! Tokens guardados.');
        this.toast.success('Sesión iniciada correctamente');
        this.router.navigateByUrl(ROUTES_MAPPING.admin.dashboard);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error en el registro:', err);
      }
    });
  }
}