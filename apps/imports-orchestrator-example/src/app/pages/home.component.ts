import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ImportsOrchestratorDirective,
  importNgModuleBootstrap,
  importStandalone,
  provideImports,
} from '@lotto24-angular/imports-orchestrator';
import type { AppImportsOrchestration } from '../app.config';

@Component({
  selector: 'example-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Home</h2>
    <ng-container import="home0"></ng-container>
    <ng-container import="home1"></ng-container>
    <ng-container import="home2"></ng-container>
    <ng-container import="home3"></ng-container>
  `,
  imports: [ImportsOrchestratorDirective],
  providers: [
    provideImports<AppImportsOrchestration>({
      // just add an import to the ES-Module exporting a standalone component
      home0: importStandalone(() => import('@lotto24-angular/imports-orchestrator-examples/home0')),

      // if it contains multiple components, select the standalone component you would like to load
      home1: importStandalone(() =>
        import('@lotto24-angular/imports-orchestrator-examples/home1').then(
          (c) => c.ImportsOrchestratorExamplesHome1Component
        )
      ),

      home2: importStandalone(() => import('@lotto24-angular/imports-orchestrator-examples/home2')),

      // or import an NgModule with the component referenced in bootstrap
      home3: importNgModuleBootstrap(
        () => import('@lotto24-angular/imports-orchestrator-examples/home3')
      ),

      /**
       * Type-safety ensures you stay on top of your priorities:
       *
       * You cannot add an import with an identifier that is not listed in your orchestration constant.
       *
       * This way you
       * 1. never define imports without orchestrating them,
       * 2. reference your orchestration constant(s) close to your imports.
       *
       * Because 'whatever' is not defined in APP_IMPORT_ORCHESTRATION, this import definition would show a type error:
       */
      // 'whatever': importNgModuleBootstrap(import('@lotto24-angular/imports-orchestrator-examples/home0')),
    }),
  ],
})
export class HomeComponent {}
