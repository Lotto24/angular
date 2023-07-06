import { ComponentRef, Directive, EventEmitter, Output } from '@angular/core';
import { ImportLifecycle } from '../import.interface';

@Directive({
  selector: '[importLifecycle]',
  standalone: true,
})
export class ImportsOrchestratorLifecycleDirective implements ImportLifecycle {
  @Output() public importQueued = new EventEmitter<void>();
  @Output() public importStarted = new EventEmitter<void>();
  @Output() public importFinished = new EventEmitter<unknown>();
  @Output() public importComponent = new EventEmitter<ComponentRef<unknown>>();
  @Output() public importErrored = new EventEmitter<unknown>();
}
