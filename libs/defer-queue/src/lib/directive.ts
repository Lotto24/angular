import {
  Directive,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { DeferQueueProcessor } from './queue/defer-queue-processor.service';

@Directive({
  selector: '[deferQueueId]',
  standalone: true,
})
export class DeferrableViewsOrchestratorDirective implements OnInit {
  @Input() public deferQueueId!: string;
  @Output() public resolved = new EventEmitter<string>();

  private readonly processor = inject(DeferQueueProcessor);

  ngOnInit(): void {
    console.log('foooo yields', this.deferQueueId);
    // this.processor.process();

    this.resolved.next(this.deferQueueId);
  }
}
