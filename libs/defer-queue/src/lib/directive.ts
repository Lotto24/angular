import { Directive, effect, inject, input } from '@angular/core';
import { DeferQueue } from './service';

@Directive({
  selector: '[deferQueueResolve]',
  standalone: true,
})
export class DeferQueueResolveDirective {
  public deferQueueResolve = input.required<string>();
  private readonly view = inject(DeferQueue).view;

  constructor() {
    effect(() => {
      this.view.resolve(this.deferQueueResolve());
    });
  }
}
