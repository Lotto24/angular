import { ComponentRef, Directive, EventEmitter, Output } from '@angular/core';
import { ImportLifecycle } from '../import.service';

@Directive({
  selector: '[importLifecycle]',
  standalone: true,
})
export class ImportsOrchestratorLifecycleDirective implements ImportLifecycle {
  /**
   * Emits when the import has been added to the queue (not started though). As the [import]-@Input may change, this may emit multiple times.
   */
  @Output() public importQueued = new EventEmitter<void>();

  /**
   * Emits when importing has started. As the [import]-@Input may change, this may emit multiple times.
   */
  @Output() public importStarted = new EventEmitter<void>();

  /**
   * Emits when importing has finished. As the [import]-@Input may change, this may emit multiple times.
   * The emitted value may be void if the import does not yield any components (eg. an NgModule without bootstrap components).
   * Otherwise an array of ComponentRefs is emitted.
   */
  @Output() public importFinished = new EventEmitter<
    ComponentRef<any>[] | void
  >();

  /**
   * Emits when importing encounters an error. As the [import]-@Input may change, this may emit multiple times.
   */
  @Output() public importErrored = new EventEmitter<any>();
}
