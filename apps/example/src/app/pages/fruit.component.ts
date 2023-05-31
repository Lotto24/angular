import {ChangeDetectionStrategy, Component} from "@angular/core";
import {
  ImportDirective,
  importNgModuleBootstrap,
  importStandalone,
  provideImports
} from "@angular-import-orchestrator/import";
import {APP_IMPORT_ORCHESTRATION} from "../app.orchestration";

@Component({
  selector: 'example-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Home</h2>
    <ng-container import="fruit0"></ng-container>
    <ng-container import="fruit1"></ng-container>
    <ng-container import="fruit2"></ng-container>
    <ng-container import="fruit3"></ng-container>
    <ng-container import="fruit4"></ng-container>
    <ng-container import="fruit5"></ng-container>
    <ng-container import="fruit6"></ng-container>
    <ng-container import="fruit7"></ng-container>
  `,
  imports: [
    ImportDirective
  ],
  providers: [
    provideImports(
      APP_IMPORT_ORCHESTRATION,
      {
        'fruit0': importStandalone(() => import('@angular-import-orchestrator/examples/fruit0')),
        'fruit1': importStandalone(() => import('@angular-import-orchestrator/examples/fruit1')),
        'fruit2': importStandalone(() => import('@angular-import-orchestrator/examples/fruit2')),
        'fruit3': importStandalone(() => import('@angular-import-orchestrator/examples/fruit3')),
        'fruit4': importStandalone(() => import('@angular-import-orchestrator/examples/fruit4')),
        'fruit5': importStandalone(() => import('@angular-import-orchestrator/examples/fruit5')),
        'fruit6': importStandalone(() => import('@angular-import-orchestrator/examples/fruit6')),
        'fruit7': importStandalone(() => import('@angular-import-orchestrator/examples/fruit7')),
      })
  ]
})
export class FruitComponent {
}
