import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  DeferQueueService,
  DeferrableViewsOrchestratorDirective,
} from 'defer-queue';
import { AsyncPipe } from '@angular/common';
import { ImportsOrchestratorExamplesHome0Component } from '@lotto24-angular/imports-orchestrator-examples/home0';
import { ImportsOrchestratorExamplesHome1Component } from '@lotto24-angular/imports-orchestrator-examples/home1';
import { ImportsOrchestratorExamplesHome2Component } from '@lotto24-angular/imports-orchestrator-examples/home2';

@Component({
  selector: 'example-defer2',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DeferrableViewsOrchestratorDirective,
    AsyncPipe,
    ImportsOrchestratorExamplesHome0Component,
    ImportsOrchestratorExamplesHome1Component,
    ImportsOrchestratorExamplesHome2Component,
  ],
  template: `
    @defer (when deferrables.when('home0', 'lower')) {
    <imports-orchestrator-examples-home0-component deferrablesResolve="home0" />
    } @placeholder {
    <div>placeholder:home0</div>
    }

    <br />

    @defer (when deferrables.when('home1')) {
    <imports-orchestrator-examples-home1-component deferQueueResolve="home1" />
    } @placeholder {
    <div>placeholder:home1</div>
    }

    <br />

    <!--    @defer (when deferQueue.when('home2', 'higher')) {-->
    <!--    <imports-orchestrator-examples-home2-component />-->
    <!--    } @placeholder {-->
    <!--      <div deferQueueResolve="home2">placeholder:home2</div>-->
    <!--    }-->
  `,
})
export class Defer2Component {
  protected readonly deferQueue = inject(DeferQueueService);
  protected readonly deferrables = this.deferQueue.deferrables();
}
