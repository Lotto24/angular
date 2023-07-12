import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  importNgModule,
  Imports,
  ImportsOrchestratorDirective,
  importStandalone,
} from '@lotto24-angular/imports-orchestrator';

@Component({
  selector: 'example-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./fruit.component.scss'],
  imports: [ImportsOrchestratorDirective],
  template: `
    <h2>Fruit</h2>
    <div class="container">
      <ng-container
        import="fruit0"
        cssClass="fruity fruit0"
        (importFinished)="onImportFinsihed('fruit0', $event)"
      ></ng-container>
      <ng-container import="fruit1" cssClass="fruity fruit1"></ng-container>
      <ng-container import="fruit2" cssClass="fruity fruit2"></ng-container>
      <ng-container import="fruit3" cssClass="fruity fruit3"></ng-container>
      <ng-container import="fruit4" cssClass="fruity fruit4"></ng-container>
      <ng-container import="fruit5" cssClass="fruity fruit5"></ng-container>
      <ng-container
        import="fruit6"
        cssClass="fruity fruit6"
        (importFinished)="onImportFinsihed('fruit6', $event)"
      ></ng-container>
      <ng-container import="fruit7" cssClass="fruity fruit7"></ng-container>
    </div>
  `,
})
@Imports({
  fruit0: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/fruit0')
  ),
  fruit1: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/fruit1')
  ),
  fruit2: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/fruit2')
  ),
  fruit3: importNgModule(
    () => import('@lotto24-angular/imports-orchestrator-examples/fruit3')
  ),
  fruit4: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/fruit4')
  ),
  fruit5: importNgModule(
    () => import('@lotto24-angular/imports-orchestrator-examples/fruit5')
  ),
  fruit6: importNgModule(
    () => import('@lotto24-angular/imports-orchestrator-examples/fruit6')
  ),
  fruit7: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/fruit7')
  ),
})
export class FruitComponent {
  public onImportFinsihed(name: string, result: unknown): void {
    console.log('FruitComponent.onImportFinished', name, result);
  }
}
