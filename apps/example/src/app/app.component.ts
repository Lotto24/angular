import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {
  ImportDirective,
  importNgModuleBootstrap,
  importStandalone,
  provideImports
} from "@angular-import-orchestrator/import";
import {APP_IMPORT_ORCHESTRATION} from "./app.orchestration";

@Component({
  standalone: true,
  imports: [RouterModule, ImportDirective],
  selector: 'example-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    provideImports(
      APP_IMPORT_ORCHESTRATION,
      {
        // just add an import to the ES-Module exporting a standalone component
        'example0': importStandalone(import('@angular-import-orchestrator/examples/example0')),

        // if it contains multiple components, select the standalone component you would like to load
        'example1': importStandalone(import('@angular-import-orchestrator/examples/example1').then(c => c.ExamplesExample1Component)),

        'example2': importStandalone(import('@angular-import-orchestrator/examples/example2')),
        // or import an NgModule with the component referenced in bootstrap
        'example3': importNgModuleBootstrap(import('@angular-import-orchestrator/examples/example3')),

        /**
         * Type-safety ensures you stay on top of your priorities:
         *
         * You cannot add an import with an identifier, that is not listed in your orchestration constant.
         *
         * This way you
         * 1. never define imports without orchestrating them,
         * 2. reference your orchestration constant(s) close to your imports.
         *
         * Because 'whatever' is not defined in APP_IMPORT_ORCHESTRATION, this import definition would show a type error:
         */
        // 'whatever': importNgModuleBootstrap(import('@angular-import-orchestrator/examples/example0')),
    })
  ]
})
export class AppComponent {
  title = 'example';
}
