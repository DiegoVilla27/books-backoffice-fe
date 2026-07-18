import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { AbstractControl, FormGroup, FormGroupDirective } from "@angular/forms";
import { combineLatest, merge, of } from "rxjs";
import { map, startWith, switchMap } from "rxjs/operators";

/**
 * Individual validation rule configuration schema mapping a validator validator token to its localized string feedback message.
 */
export interface IValidation {
  /** The ValidatorFn identifier key representation (e.g., 'required', 'minlength'). */
  type: string;
  /** Custom user-facing message returned when the validation state resolves as invalid. */
  message: string;
}

/**
 * Validation messages mapping dictionary where keys correspond to form control property names.
 */
export type IErrorMsg = { [key: string]: IValidation[] };

/**
 * Performance-optimized component responsible for declarative form control validation layout rendering.
 * Leverages multi-stream bridge mappings to safely intercept form submissions and dirty status toggles,
 * executing layout cycles exclusively when signal bindings update.
 */
@Component({
  selector: "validator-error-msg",
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShowErrors()) {
      <div class="flex flex-col gap-1 mt-0.5">
        @for (validation of activeErrors(); track validation.type) {
          <span class="text-[10px] font-mono text-red-400 flex items-center gap-1.5 animate-fade-in">
            <span class="h-1 w-1 rounded-full bg-red-500 shrink-0"></span>
            {{ validation.message }}
          </span>
        }

        @for (msg of dynamicErrors(); track msg) {
          <span class="text-[10px] font-mono text-red-400 flex items-center gap-1.5 animate-fade-in">
            <span class="h-1 w-1 rounded-full bg-red-500 shrink-0"></span>
            {{ msg }}
          </span>
        }
      </div>
    }
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMsgComponent {
  /** Target parent form group instances tree container required to trace controls status. */
  form = input.required<FormGroup>();
  /** Static validation feedback messages layout schema dictionary configuration. */
  errorMessagesMap = input.required<IErrorMsg>();
  /** Target form control string lookup path. Supports dot-notation references for deep nesting. */
  type = input.required<string>();

  /** Optional token reference to parent form directive wrapper context used to intercept native submit pipeline events. */
  private formDirective = inject(FormGroupDirective, { optional: true });

  /**
   * Reactive computed evaluation resolving the base structural rules dictionary list matching the current targeted token.
   */
  private configuredValidations = computed(() => {
    const controlKey = this.type().split('.').pop() || '';
    return this.errorMessagesMap()[controlKey] || [];
  });

  /**
   * Internal reactive state bridge that dynamically maps asynchronous Reactive Form status mutations, 
   * data updates, and submission triggers into a unified, lightweight stateful Signal object representation.
   */
  private controlState = toSignal(
    combineLatest([
      toObservable(this.form),
      toObservable(this.type)
    ]).pipe(
      switchMap(([form, type]) => {
        const control = this.findControl(form, type);
        if (!control) {
          return of({ control: null as AbstractControl | null, invalid: false, dirty: false, touched: false, submitted: false });
        }

        const trigger$ = merge(
          control.statusChanges,
          control.valueChanges,
          this.formDirective ? this.formDirective.ngSubmit : of(null)
        );

        return trigger$.pipe(
          map(() => ({
            control,
            invalid: control.invalid,
            dirty: control.dirty,
            touched: control.touched,
            submitted: this.formDirective?.submitted ?? false
          })),
          startWith({
            control,
            invalid: control.invalid,
            dirty: control.dirty,
            touched: control.touched,
            submitted: this.formDirective?.submitted ?? false
          })
        );
      })
    ),
    {
      initialValue: { control: null as AbstractControl | null, invalid: false, dirty: false, touched: false, submitted: false }
    }
  );

  /**
   * Reactive computed condition evaluating if the current bound viewport constraints necessitate error layout injection.
   */
  shouldShowErrors = computed(() => {
    const state = this.controlState();
    return state.invalid && (state.dirty || state.touched || state.submitted);
  });

  /**
   * Reactive computed parser tracking runtime custom error strings that escape standard structural configurations.
   */
  dynamicErrors = computed(() => {
    const state = this.controlState();
    const control = state.control;
    if (!control || !control.errors) return [];

    const errors = control.errors;
    const dynamicMessages: string[] = [];
    const handledTypes = this.configuredValidations().map(v => v.type);

    Object.keys(errors).forEach((key) => {
      const errorValue = errors[key];
      if (!handledTypes.includes(key) && typeof errorValue === 'string') {
        dynamicMessages.push(errorValue);
      }
    });

    return dynamicMessages;
  });

  /**
   * Reactive computed pipeline sorting and filtering configuration trees to emit currently active validation failures.
   */
  activeErrors = computed(() => {
    const state = this.controlState();
    const validations = this.configuredValidations();

    return validations.filter(validation =>
      Boolean(state.control?.hasError(validation.type) && (state.dirty || state.touched || state.submitted))
    );
  });

  /**
   * Traverses deep nested abstract controller structural paths securely using string dot notation identifiers.
   * 
   * @param control - Base control entry point node.
   * @param path - Object key dot notation pathway mapping.
   * @returns The resolved AbstractControl instance or null if the hierarchy mapping breaks.
   */
  private findControl(control: AbstractControl, path: string): AbstractControl | null {
    const paths = path.split(".");
    let currentControl: AbstractControl | null = control;

    for (const p of paths) {
      if (currentControl instanceof FormGroup) {
        currentControl = currentControl.get(p);
      } else {
        return null;
      }
    }
    return currentControl;
  }
}