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
  templateUrl: './defer.component.html',
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
    'lowest',
    this.injector
  );

  public state$ = this.deferQueue
    .state$(
      0,
      () =>
        import('@lotto24-angular/imports-orchestrator-examples/service0').then(
          (esm) => esm.Service0
        ),
      'lowest'
    )
}
