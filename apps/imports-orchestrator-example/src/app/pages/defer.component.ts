import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DeferQueue, DeferQueueResolveDirective } from 'defer-queue';
import { AsyncPipe } from '@angular/common';
import { ImportsOrchestratorExamplesFruit0Component } from '@lotto24-angular/imports-orchestrator-examples/fruit0';
import { ImportsOrchestratorExamplesFruit1Component } from '@lotto24-angular/imports-orchestrator-examples/fruit1';
import { ImportsOrchestratorExamplesFruit2Component } from '@lotto24-angular/imports-orchestrator-examples/fruit2';
import { ImportsOrchestratorExamplesFruit3Module } from '@lotto24-angular/imports-orchestrator-examples/fruit3';
import { ImportsOrchestratorExamplesFruit4Component } from '@lotto24-angular/imports-orchestrator-examples/fruit4';

@Component({
  selector: 'example-defer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DeferQueueResolveDirective,
    AsyncPipe,
    ImportsOrchestratorExamplesFruit0Component,
    ImportsOrchestratorExamplesFruit1Component,
    ImportsOrchestratorExamplesFruit2Component,
    ImportsOrchestratorExamplesFruit3Module,
    ImportsOrchestratorExamplesFruit4Component,
  ],
  template: `
    <!-- this item has lowest priority, but will resolve ahead of other items because of the addiitional viewport trigger -->
    @defer (when queueView.when('fruit0', 'lower'); on viewport; ) {
    <imports-orchestrator-examples-fruit0-component
      deferQueueResolve="fruit0"
    />
    } @placeholder {
    <div>fruit0</div>
    }

    <br />

    <!-- this item has default priority, and will resolve following high priority items -->
    @defer (when queueView.when('fruit1')) {
    <imports-orchestrator-examples-fruit1-component
      deferQueueResolve="fruit1"
    />
    }

    <br />
    <!-- this item has higher priority, it will be prioritized -->
    @defer (when queueView.when('fruit2', 'higher')) {
    <imports-orchestrator-examples-fruit2-component
      deferQueueResolve="fruit2"
    />
    }

    <br />
    @defer (when queueView.when('fruit3', 'low')) {
    <imports-orchestrator-examples-fruit3-component
      deferQueueResolve="fruit3"
    />
    }

    <br />
    <!-- this item has a custom, numeric, very high priority, it actually has the highest priority and will resolve first. -->
    @defer (when queueView.when('fruit4', 1329576235)) {
    <imports-orchestrator-examples-fruit4-component
      deferQueueResolve="fruit4"
    />
    }

    <br />
    Reactive state from lazy-loaded service providing observable state
    {{ state$ | async }}

    <br />
    Reactive state from lazy-loaded service providing signal state {{ state() }}
  `,
})
export class DeferComponent {
  protected readonly queue = inject(DeferQueue);
  protected readonly queueView = this.queue.view;

  public state = this.queue.state(
    420,
    () =>
      import('@lotto24-angular/imports-orchestrator-examples/service1').then(
        (esm) => esm.Service1
      ),
    'higher'
  );

  public state$ = this.queue.state$(
    123,
    () =>
      import('@lotto24-angular/imports-orchestrator-examples/service0').then(
        (esm) => esm.Service0
      ),
    'low'
  );
}
