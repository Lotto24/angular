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
      // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
      inputs: ['import', 'providers', 'timeout'],
    },
    {
      directive: ImportsOrchestratorIODirective,
      // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
      inputs: ['inputs', 'outputs'],
    },
    {
      directive: ImportsOrchestratorLifecycleDirective,
      // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
      outputs: [
        'importQueued',
        'importStarted',
        'importFinished',
        'importComponent',
        'importErrored',
      ],
    },
    {
      directive: ImportsOrchestratorCSSClassDirective,
      // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
      inputs: ['cssClass'],
    },
  ],
})
export class ImportsOrchestratorDirective {}
