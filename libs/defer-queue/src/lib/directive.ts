import { Directive, inject, Input, OnDestroy } from '@angular/core';
import { DeferQueueService } from './service';

@Directive({
  selector: '[deferQueueResolve]',
  standalone: true,
})
export class DeferrableViewsOrchestratorDirective implements OnDestroy {
  @Input() public deferQueueResolve!: string;

  private readonly deferQueue = inject(DeferQueueService);

  ngOnDestroy(): void {
    this.deferQueue.deferrable(this.deferQueueResolve).resolve();
  }
}
