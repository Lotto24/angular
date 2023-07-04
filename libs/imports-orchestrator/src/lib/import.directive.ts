import { Directive } from '@angular/core';

import {
  ImportsOrchestratorClassDirective,
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
      inputs: ['import', 'providers'],
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
      directive: ImportsOrchestratorClassDirective,
      inputs: ['cssClass'],
    },
  ],
})
export class ImportsOrchestratorDirective {}
