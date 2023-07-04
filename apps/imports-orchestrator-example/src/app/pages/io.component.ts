import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy} from '@angular/core';
import {
  ImportsOrchestratorDirective,
  importStandalone,
  provideImports,
} from '@lotto24-angular/imports-orchestrator';
import { AppImportsOrchestration } from '../app.config';
import {interval, Subscription} from 'rxjs';

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
      <ng-container
        import="input"
        [inputs]="{ test: test, changing: changing }"
        [outputs]="{ testChange: outputChange.bind(this) }"
      ></ng-container>
    <h3>Output: {{ outputText }}</h3>
    </div>
  `,
})
export class IOComponent implements OnDestroy {
  @Input()
  public test: string = 'test';

  @Input()
  public changing: number = 0;
  private subscriptions = new Subscription();
  public outputText: string = '';

  constructor(cdr: ChangeDetectorRef) {
    const sub = interval(500).subscribe((value) => {
      this.changing = value;
      console.log('this.inputs', this.changing);
      cdr.markForCheck();
    });

    this.subscriptions.add(sub);
  }

  public outputChange(value: string): void {
    this.outputText = value;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
