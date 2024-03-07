import { Directive, inject, Input, OnInit } from '@angular/core';
import { DeferQueueService } from './service';

@Directive({
  selector: '[deferQueueId]',
  standalone: true,
})
export class DeferrableViewsOrchestratorDirective implements OnInit {
  @Input() public deferQueueId!: string;

  private readonly deferQueue = inject(DeferQueueService);

  ngOnInit(): void {
    console.log('foooo yields', this.deferQueueId);
    this.deferQueue.queued(this.deferQueueId).resolveFn();
  }
}
