import { inject, Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { UsersService } from '@modules/admin/pages/users/services/users.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UniqueEmailValidator {
  private usersSvc = inject(UsersService);

  /**
   * Factory token generator returning an isolated, event-driven `AsyncValidatorFn` decoupled from standard key stroke inputs.
   * Leverages an external lifecycle stream anchor to synchronize database-level assertions exclusively on focus mutations.
   * 
   * @remarks
   * This validation architecture coordinates two optimization guard zones:
   * 1. **Synchronous Short-Circuiting:** Prior to routing queries over the wire network layer, it inspects 
   *    active control errors (`pattern`, `required`, etc.). If structural formats are breached, it short-circuits 
   *    synchronously returning `of(null)` to prevent backend pipeline throttling.
   * 2. **Stream Gateway Binding:** Wraps the service request inside a `blur$.pipe(take(1))` buffer pipeline. 
   *    This holds transaction initialization pending a discrete push notification trigger event, switching 
   *    the downstream execution context natively using a highly efficient `switchMap` strategy.
   * 
   * @param blur$ - Stateful subject payload emitter broadcasting focus-loss events from the parent view layout layer.
   * @returns A configured `AsyncValidatorFn` context monitoring runtime target identity availability constraints.
   */
  create(blur$: Subject<void>): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // 1. Si no hay valor, salimos de inmediato
      if (!control.value || control.errors?.['pattern']) return of(null);

      // 2. 🚀 EL BLINDAJE: Inspeccionamos si ya existen errores síncronos activos (required, email, etc.)
      // Si el control tiene errores y NO son causados por nuestra propia comprobación asíncrona,
      // cancelamos la petición HTTP y devolvemos null (no añadimos más errores).
      if (control.errors && Object.keys(control.errors).some(key => key !== 'emailExists')) {
        return of(null);
      }

      // 3. Si el formato es 100% válido para los ojos de los validadores síncronos, disparamos a la DB
      return blur$.pipe(
        take(1),
        switchMap(() => this.usersSvc.checkEmailExists(control.value)),
        map((isTaken) => (isTaken ? { emailExists: true } : null)),
        catchError(() => of(null)) // Si falla la API, asumimos que pasa para no bloquear
      )
    };
  }
}