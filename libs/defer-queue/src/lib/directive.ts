import { Directive, inject, Input, OnInit } from '@angular/core';
import { DeferQueueService } from './service';

@Directive({
  selector: '[deferQueueResolve]',
  standalone: true,
})
export class DeferrableViewsOrchestratorDirective implements OnInit {
  @Input() public deferQueueResolve!: string;

  private readonly deferrables = inject(DeferQueueService).view;

  ngOnInit(): void {
    this.deferrables.resolve(this.deferQueueResolve);
  }
}
