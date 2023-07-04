import { Directive } from '@angular/core';

import {
  ImportsOrchestratorClassDirective,
  ImportsOrchestratorQueueDirective,
} from './host-directive';
import { ImportsOrchestratorIODirective } from './host-directive/import-io.directive';
import { ImportsOrchestratorLifecycleDirective } from './host-directive/import-lifecycle.directive';

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
      outputs: ['importQueued', 'importStarted', 'importFinished', 'importErrored'],
    },
    {
      directive: ImportsOrchestratorClassDirective,
      inputs: ['cssClass'],
    },
  ],
})
export class ImportsOrchestratorDirective {}
