import { Directive, Input, TemplateRef, inject } from '@angular/core';

/**
 * Structural directive mapping custom cells layouts to specific columns keys.
 */
@Directive({
  selector: '[appCellDef]',
  standalone: true
})
export class CellDefDirective {
  /** Reference token pointing to the decorated template block. */
  template = inject(TemplateRef);

  /** Target columnName lookup key that this template represents. */
  @Input('appCellDef') columnName!: string;
}

/**
 * Structural directive representing the custom actions buttons cell template block.
 */
@Directive({
  selector: '[appActionsDef]',
  standalone: true
})
export class ActionsDefDirective {
  /** Reference token pointing to the actions template block. */
  template = inject(TemplateRef);
}