import {ChangeDetectionStrategy, Component, inject} from '@angular/core';

@Component({
  selector: 'imports-orchestrator-examples-home3-component',
  templateUrl: './imports-orchestrator-examples-home3.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportsOrchestratorExamplesHome3Component {
  // @ts-ignore
  foo = inject('foo');
}
