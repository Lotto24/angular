import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  importNgModule,
  Imports,
  ImportsOrchestratorDirective,
  importStandalone,
} from '@lotto24-angular/imports-orchestrator';

@Component({
  selector: 'example-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImportsOrchestratorDirective],
  styles: [
    `
      .tabs {
        display: grid;
        grid-gap: 10px;
        grid-auto-flow: column;
        grid-auto-columns: min-content;
      }

      .tab {
        cursor: pointer;
        background-color: #ccc;
        padding: 5px;
      }
    `,
  ],
  template: `
    <h2>Tab</h2>
    <div class="container">
      <nav class="tabs">
        <a (click)="selectTab(0)" class="tab">tab0</a>
        <a (click)="selectTab(1)" class="tab">tab1</a>
        <a (click)="selectTab(2)" class="tab">tab2</a>
      </nav>
      <ng-container
        [import]="importId"
        (importFinished)="onImportFinsihed(importId, $event)"
      ></ng-container>
      <!-- will not be removed -->
      <ng-container import="tabKeep"></ng-container>
    </div>
  `,
})
@Imports({
  tab0: importNgModule(
    () => import('@lotto24-angular/imports-orchestrator-examples/tab0')
  ),
  tab1: importNgModule(
    () => import('@lotto24-angular/imports-orchestrator-examples/tab1')
  ),
  tab2: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/tab2')
  ),
  tabKeep: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/tab-keep')
  ),
})
export class TabComponent {
  public importId: string = 'tab0';

  public selectTab(index: number): void {
    this.importId = `tab${index}`;
  }

  public onImportFinsihed(name: string, result: unknown): void {
    console.log('TabComponent.onImportFinished', name, result);
  }
}
