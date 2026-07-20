import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputComponent } from '@shared/components/ui/input/input.component';
import { AuthService } from '@modules/auth/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { loginValidations } from './validations';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';

/**
 * Component controller for the Login credential page view.
 *
 * @remarks
 * Builds and validates the sign-in form, dispatching authentication requests to the {@link AuthService}.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  /** FormBuilder helper reference to construct reactive form validation trees. */
  private fb = inject(FormBuilder);
  /** Angular Router reference for post-auth view transitions. */
  private router = inject(Router);
  /** Injected Authentication service helper. */
  private authSvc = inject(AuthService);
  /** Core toast notification engine. */
  private toast = inject(ToastService);

  /** Reactive form instance containing user credentials inputs. */
  loginForm!: FormGroup;
  /** Active submitting flag indicator to throttle double clicks. */
  isSubmitting = signal<boolean>(false);

  /** Validation message mappings used in the form layout. */
  validations = loginValidations;

  constructor() {
    this.initForm();
  }

  /**
   * Sets up default credentials and validations for the Login form fields.
   */
  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['andres.rodriguez.1@example.com', [Validators.required, Validators.email]],
      password: ['1234', [Validators.required]]
    });
  }

  /**
   * Form submit handler. Validates inputs, triggers loading state, and logs the user in.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.loginForm.value;

    this.authSvc.login(payload).subscribe({
      next: (user) => {
        this.isSubmitting.set(false);

        if (user.role !== 'ADMIN') {
          this.toast.error('Acceso denegado. Se requieren permisos de Administrador.');
          this.authSvc.logout();
          return;
        }

        this.toast.success('Sesión iniciada correctamente');
        this.router.navigateByUrl(ROUTES_MAPPING.admin.dashboard);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error en el login:', err);
      }
    });
  }
}