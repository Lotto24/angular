import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  Signal,
  signal,
} from '@angular/core';
import { ImportsOrchestratorExamplesHome1Component } from '@lotto24-angular/imports-orchestrator-examples/home1';
import { ImportsOrchestratorExamplesHome0Component } from '@lotto24-angular/imports-orchestrator-examples/home0';
import { DeferrableViewsOrchestratorDirective } from 'defer-queue';

@Component({
  selector: 'example-defer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ImportsOrchestratorExamplesHome1Component,
    ImportsOrchestratorExamplesHome0Component,
    DeferrableViewsOrchestratorDirective,
  ],
  template: `
    @defer (when queued('home0')) {
    <imports-orchestrator-examples-home0-component
      deferQueueId="home0"
      (resolved)="next()"
    />
    } @defer (when queued('home1')) {
    <imports-orchestrator-examples-home1-component
      deferQueueId="home1"
      (resolved)="next()"
    />
    }
  `,
})
export class DeferComponent implements AfterViewInit {
  private _queue: string[] = ['home1', 'home0'];

  private signalCache: { [key: string]: Signal<boolean> } = {};

  private queueSignal = signal<string | boolean>(false);

  public ngAfterViewInit(): void {
    this.next();
  }

  public queued(identifier: string): boolean {
    if (!this.signalCache[identifier]) {
      const signalForIdentifier = computed(() => {
        const value = this.queueSignal() === identifier;
        console.log('fooo computed value', identifier, value);
        return value;
      });

      this.signalCache[identifier] = signalForIdentifier;
    }

    return this.signalCache[identifier]();
  }

  public next(): void {
    const item = this._queue.shift();
    console.log('fooo next', item);
    if (item) {
      this.queueSignal.set(item);
    }
  }
}
