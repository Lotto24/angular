import { Directive } from '@angular/core';

import {
  ImportsOrchestratorCSSClassDirective,
  ImportsOrchestratorIODirective,
  ImportsOrchestratorLifecycleDirective,
  ImportsOrchestratorQueueDirective,
} from './host-directive';

@Directive({
  selector: '[import]',
  standalone: true,
  hostDirectives: [
    {
      directive: ImportsOrchestratorQueueDirective,
      inputs: ['import', 'providers', 'timeout'],
    },
    {
      directive: ImportsOrchestratorIODirective,
      inputs: ['inputs', 'outputs'],
    },
    {
      directive: ImportsOrchestratorLifecycleDirective,
      outputs: [
        'importQueued',
        'importStarted',
        'importFinished',
        'importErrored',
      ],
    },
    {
      directive: ImportsOrchestratorCSSClassDirective,
      inputs: ['cssClass'],
    },
  ],
})
export class ImportsOrchestratorDirective {}
