import {ChangeDetectionStrategy, Component, inject} from '@angular/core';

@Component({
  standalone: true,
  selector: 'imports-orchestrator-examples-home2-child1-component',
  templateUrl: './imports-orchestrator-examples-home2-child1.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportsOrchestratorExamplesHome2Child1Component {
  // @ts-ignore
  foo = inject('foo');
}
