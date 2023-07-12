import { ComponentRef, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { ComponentIO } from './host-directive';

export interface ImportLifecycle {
  /**
   * Emits when the import has been added to the queue (not started though). As the [import]-@Input may change, this may emit multiple times.
   */
  importQueued: EventEmitter<void>;

  /**
   * Emits when importing has started. As the [import]-@Input may change, this may emit multiple times.
   */
  importStarted: EventEmitter<void>;

  /**
   * Emits when importing has finished. As the [import]-@Input may change, this may emit multiple times.
   * The emitted value is whatever is returned as the result of the resolve function
   */
  importFinished: EventEmitter<unknown>;

  /**
   * Emits when importing encounters an error. As the [import]-@Input may change, this may emit multiple times.
   */
  importErrored: EventEmitter<unknown>;

  /**
   * Emits when importing has finished. Emits for every component that was imported.
   * When bootstrapping multiple components, this will emit multiple times
   * Plus, as the [import]-@Input may change, this may emit multiple times for the same component.
   *
   */
  importComponent: EventEmitter<ComponentRef<unknown>>;
}

export interface ImportObservableComponentIO {
  readonly inputs$: Observable<ComponentIO>;
  readonly outputs$: Observable<ComponentIO>;
}
