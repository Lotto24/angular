import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  importNgModule,
  Imports,
  ImportsOrchestratorDirective,
  importStandalone
} from "@lotto24-angular/imports-orchestrator";

@Component({
  selector: 'imports-orchestrator-examples-home2-component',
  standalone: true,
  imports: [CommonModule, ImportsOrchestratorDirective],
  templateUrl: './imports-orchestrator-examples-home2.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Imports({
  child0: importNgModule(
    () => import('@lotto24-angular/imports-orchestrator-examples/home2-child0')
  ),
  child1: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/home2-child1')
  ),
})
export class ImportsOrchestratorExamplesHome2Component {
  public providers = [{ provide: 'foo', useValue: 'bar'}]
}
