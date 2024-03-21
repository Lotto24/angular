import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  Imports,
  ImportsOrchestratorDirective,
  importStandalone,
} from '@lotto24-angular/imports-orchestrator';
import { AppImportsOrchestration } from './app.config';
import {DeferQueue, DeferQueueResolveDirective} from "defer-queue";
import {ImportsOrchestratorExamplesFooter0Component} from "@lotto24-angular/imports-orchestrator-examples/footer0";
import {ImportsOrchestratorExamplesFooter1Component} from "@lotto24-angular/imports-orchestrator-examples/footer1";
import {ImportsOrchestratorExamplesFooter2Component} from "@lotto24-angular/imports-orchestrator-examples/footer2";

@Component({
  standalone: true,
  imports: [
    RouterModule,
    ImportsOrchestratorDirective,
    ImportsOrchestratorExamplesFooter0Component,
    DeferQueueResolveDirective,
    ImportsOrchestratorExamplesFooter1Component,
    ImportsOrchestratorExamplesFooter2Component,
  ],
  selector: 'example-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
@Imports<AppImportsOrchestration>({
  footer0: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/footer0')
  ),
  footer1: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/footer1')
  ),
  footer2: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/footer2')
  ),
})
export class AppComponent {
  title = 'example';

  protected readonly deferQueueView = inject(DeferQueue).view;

  private router = inject(Router);

  constructor() {
    this.router.events.subscribe((event) => console.log('router', event));
  }
}
