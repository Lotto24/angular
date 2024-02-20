import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  importNgModule,
  Imports,
  ImportsOrchestratorComponent,
  ImportsOrchestratorDirective,
  importStandalone,
} from '@lotto24-angular/imports-orchestrator';
import { BehaviorSubject } from 'rxjs';
import { AppImportsOrchestration } from '../app.config';

@Component({
  selector: 'example-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Home</h2>
    <ng-container import="home0"></ng-container>
    <import identifier="home1"></import>
    <ng-container
      import="observableInput"
      [inputs]="{testInput$}"
      ]
    ></ng-container>
    <ng-container import="deferredPromise"></ng-container>
    <ng-container import="deferredObservable"></ng-container>
    <ng-container import="deferredSignal"></ng-container>
    <ng-container import="home2"></ng-container>
    <ng-container import="home3" [providers]="providers"></ng-container>
    <div>
      <h3>aliased</h3>
      <ng-container import="alias0"></ng-container>
      <ng-container import="alias1"></ng-container>
    </div>

  `,
  imports: [ImportsOrchestratorDirective, ImportsOrchestratorComponent],
})
@Imports<AppImportsOrchestration>({
  // just add an import to the ES-Module exporting a standalone component
  home0: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/home0')
  ),

  // if it contains multiple components, select the standalone component you would like to load
  home1: importStandalone(() =>
    import('@lotto24-angular/imports-orchestrator-examples/home1').then(
      (c) => c.ImportsOrchestratorExamplesHome1Component
    )
  ),

  home2: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/home2')
  ),

  // or import an NgModule with the component referenced in bootstrap
  home3: importNgModule(
    () => import('@lotto24-angular/imports-orchestrator-examples/home3')
  ),
  deferredPromise: importStandalone(() =>
    import(
      '@lotto24-angular/imports-orchestrator-examples/deferred'
    ).then((esm) => esm.DeferredPromiseComponent)
  ),
  deferredObservable: importStandalone(() =>
    import(
      '@lotto24-angular/imports-orchestrator-examples/deferred'
    ).then((esm) => esm.DeferredObservableComponent)
  ),
  deferredSignal: importStandalone(() =>
    import(
      '@lotto24-angular/imports-orchestrator-examples/deferred'
    ).then((esm) => esm.DeferredSignalComponent)
  ),
  observableInput: importStandalone(
    () =>
      import(
        '@lotto24-angular/imports-orchestrator-examples/observable-input-home'
      )
  ),
  alias0: 'home0',
  alias1: 'home1',
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
})
export class HomeComponent {
  public testInput$ = new BehaviorSubject('Working!');

  public providers = [{ provide: 'foo', useValue: 'bar'}]
}
