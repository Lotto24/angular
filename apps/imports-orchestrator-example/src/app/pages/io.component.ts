import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
} from '@angular/core';
import {
  importNgModule,
  ImportsOrchestratorDirective,
  importStandalone,
  provideImports,
} from '@lotto24-angular/imports-orchestrator';
import { AppImportsOrchestration } from '../app.config';
import { interval, scan } from 'rxjs';

@Component({
  selector: 'example-io',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImportsOrchestratorDirective],
  providers: [
    provideImports<AppImportsOrchestration>({
      input: importStandalone(
        () => import('@lotto24-angular/imports-orchestrator-examples-static/io')
      ),
    }),
  ],
  styles: [],
  template: `
    <h2>Inputs/Outputs</h2>
    <div class="container">
      <ng-container import="input" [inputs]="{ test: test, changing: changing }"></ng-container>
    </div>
  `,
})
export class IOComponent {
  public test: string = 'test';
  public changing: number = 0;

  constructor() {
    interval(500)
      .pipe(scan((acc, value) => acc + value, 0))
      .subscribe((value) => (this.changing = value));
  }
}
