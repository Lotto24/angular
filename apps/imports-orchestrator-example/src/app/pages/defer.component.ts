import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  OnInit,
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
export class DeferComponent implements OnInit {
  protected readonly deferQueue = inject(DeferQueueService);
  private readonly injector = inject(Injector);

  private service0 = this.deferQueue
    .service$(
      () =>
        import('@lotto24-angular/imports-orchestrator-examples/service0').then(
          (esm) => esm.Service0
        ),
      'lowest'
    )
    .subscribe((instance) => console.log('service0.foo? ', instance.foo()));

  async ngOnInit(): Promise<void> {
    const service = await this.deferQueue.serviceAsync(
      () =>
        import('@lotto24-angular/imports-orchestrator-examples/service0').then(
          (esm) => esm.Service0
        ),
      'lowest',
      this.injector
    );
    console.log('service0.foo? ', service.foo());
  }
}
