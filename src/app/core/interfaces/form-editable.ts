import { Observable } from 'rxjs';

/**
 * Interface contract for components that handle volatile or uncommitted data streams.
 * Allows the structural routing layer to determine if layout mutations require user confirmation.
 */
export interface FormEditableComponent {
  /**
   * Evaluates whether the current component state contains unsaved or dirty data modifications.
   * 
   * @returns True if the entity state is modified and pending commit, false otherwise.
   */
  isDirty(): boolean | Observable<boolean> | Promise<boolean>;
}