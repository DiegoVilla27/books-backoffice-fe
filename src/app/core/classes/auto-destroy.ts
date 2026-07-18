import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Abstract base class providing automatic RxJS observable subscription cleanup using `DestroyRef`.
 *
 * @remarks
 * Subclasses should extend this class and apply the `drop` operator to observable streams.
 * When the Angular component lifecycle triggers destruction, all piped subscriptions are automatically clean-up.
 *
 * @example
 * ```typescript
 * @Component({ ... })
 * export class UsersComponent extends AutoDestroyBase {
 *   deleteUser(user: User) {
 *     this.usersSvc.delete(user.id).pipe(this.drop()).subscribe(...);
 *   }
 * }
 * ```
 */
export class AutoDestroyBase {
  /** Captured angular component destroy reference token. */
  protected destroyRef = inject(DestroyRef);

  /**
   * Piped RxJS operator that handles automatic stream termination on component destruction.
   *
   * @typeParam T - The shape of the expected values emitted by the observable.
   * @returns MonoTypeOperatorFunction handling stream lifecycle bounds.
   */
  protected drop<T>() {
    return takeUntilDestroyed<T>(this.destroyRef);
  }
}