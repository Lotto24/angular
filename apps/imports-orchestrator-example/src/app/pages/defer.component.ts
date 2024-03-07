import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ImportsOrchestratorExamplesHome1Component } from '@lotto24-angular/imports-orchestrator-examples/home1';
import { ImportsOrchestratorExamplesHome0Component } from '@lotto24-angular/imports-orchestrator-examples/home0';
import {
  DeferQueueService,
  DeferrableViewsOrchestratorDirective,
} from 'defer-queue';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'example-defer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ImportsOrchestratorExamplesHome1Component,
    ImportsOrchestratorExamplesHome0Component,
    DeferrableViewsOrchestratorDirective,
    AsyncPipe,
  ],
  template: `
    @defer (when deferQueue.item('home0').triggered()) {
        <imports-orchestrator-examples-home0-component deferQueueResolve="home0" />
    }

    @defer (when deferQueue.item('home1').triggered()) {
        <imports-orchestrator-examples-home1-component deferQueueResolve="home1" />
    }
  `,
})
export class DeferComponent {
  readonly deferQueue = inject(DeferQueueService);
}
