import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
} from '@angular/core';
import {
  DeferQueueService,
  DeferrableViewsOrchestratorDirective,
} from 'defer-queue';
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
    DeferrableViewsOrchestratorDirective,
    AsyncPipe,
    ImportsOrchestratorExamplesFruit0Component,
    ImportsOrchestratorExamplesFruit1Component,
    ImportsOrchestratorExamplesFruit2Component,
    ImportsOrchestratorExamplesFruit3Module,
    ImportsOrchestratorExamplesFruit4Component,
  ],
  template: `
    <!-- this item has lowest priority, but will resolve ahead of other items because of the addiitional viewport trigger -->
    @defer (when deferQueue.when('fruit0', 'lower'); on viewport;) {
    <imports-orchestrator-examples-fruit0-component />
    } @placeholder {
    <div deferQueueResolve="fruit0">fruit0 will be placed here</div>
    }

    <br />

    <!-- this item has default priority, and will resolve following high priority items -->
    @defer (when deferQueue.when('fruit1')) {
    <imports-orchestrator-examples-fruit1-component />
    } @placeholder {
    <ng-container deferQueueResolve="fruit1" />
    }

    <br />
    <!-- this item has higher priority, it will be prioritized -->
    @defer (when deferQueue.when('fruit2', 'higher')) {
    <imports-orchestrator-examples-fruit2-component />
    } @placeholder {
    <ng-container deferQueueResolve="fruit2" />
    }

    <br />
    @defer (when deferQueue.when('fruit3', 'low')) {
    <imports-orchestrator-examples-fruit3-component />
    } @placeholder {
    <ng-container deferQueueResolve="fruit3" />
    }

    <br />
    <!-- this item has a custom, numeric, very high priority, it actually has the highest priority and will resolve first. -->
    @defer (when deferQueue.when('fruit4', 1329576235)) {
    <imports-orchestrator-examples-fruit4-component />
    } @placeholder {
    <ng-container deferQueueResolve="fruit4" />
    }

    <br />
    Reactive state from lazy-loaded signal-based service {{ state$ | async }}

    <br />
    Reactive state from lazy-loaded signal-based service {{ state() }}
  `,
})
export class DeferComponent {
  protected readonly deferQueue = inject(DeferQueueService);
  private readonly injector = inject(Injector);

  public state = this.deferQueue.state(
    0,
    () =>
      import('@lotto24-angular/imports-orchestrator-examples/service1').then(
        (esm) => esm.Service1
      ),
    'higher',
    this.injector
  );

  public state$ = this.deferQueue.state$(
    0,
    () =>
      import('@lotto24-angular/imports-orchestrator-examples/service0').then(
        (esm) => esm.Service0
      ),
    'low'
  );
}
