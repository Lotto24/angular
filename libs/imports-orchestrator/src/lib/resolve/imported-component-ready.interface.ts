import { EventEmitter } from '@angular/core';

/**
 * When implementing this interface, the queue will be interrupted until `importedComponentReady` emits
 */
export interface ImportedComponentReadyEmitter {
  importedComponentReady: EventEmitter<undefined>;
}
