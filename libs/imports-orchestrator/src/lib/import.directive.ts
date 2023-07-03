import { Directive } from '@angular/core';

import {
  ImportsOrchestratorClassDirective,
  ImportsOrchestratorQueueDirective,
} from './host-directive';

@Directive({
  selector: '[import]',
  standalone: true,
  hostDirectives: [
    {
      directive: ImportsOrchestratorQueueDirective,
      inputs: ['import', 'orderKey', 'providers', 'inputs', 'outputs'],
      outputs: ['importFinished', 'importQueued'],
    },
    {
      directive: ImportsOrchestratorClassDirective,
      inputs: ['cssClass'],
    },
  ],
})
export class ImportsOrchestratorDirective {}
