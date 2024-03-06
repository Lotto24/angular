import {ChangeDetectionStrategy, Component, inject} from '@angular/core';

@Component({
  selector: 'imports-orchestrator-examples-home2-child0-component',
  templateUrl: './imports-orchestrator-examples-home2-child0.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportsOrchestratorExamplesHome2Child0Component {
  // @ts-ignore
  foo = inject('foo');
}
