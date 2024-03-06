import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ImportsOrchestratorExamplesHome1Component } from '@lotto24-angular/imports-orchestrator-examples/home1';
import { ImportsOrchestratorExamplesHome0Component } from '@lotto24-angular/imports-orchestrator-examples/home0';

@Component({
  selector: 'example-defer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ImportsOrchestratorExamplesHome1Component,
    ImportsOrchestratorExamplesHome0Component,
  ],
  template: `
    @defer (when load0()) {
    <imports-orchestrator-examples-home0-component />
    }
    @defer (when load1()) {
    <imports-orchestrator-examples-home1-component />
    }
  `,
})
export class DeferComponent {
  public load0 = signal(false);
  public load1 = signal(false);

  constructor() {
    setTimeout(() => {
      this.load0.set(true);
    }, 2000);

    setTimeout(() => {
      this.load1.set(true);
    }, 4000);
  }
}
