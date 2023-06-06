import { Directive } from '@angular/core';

import {
  ImportsOrchestratorClassDirective,
  ImportsOrchestratorLoaderDirective,
  ImportsOrchestratorQueueDirective,
} from './host-directive';

@Directive({
  selector: '[import]',
  standalone: true,
  hostDirectives: [
    ImportsOrchestratorLoaderDirective,
    {
      directive: ImportsOrchestratorQueueDirective,
      inputs: ['import', 'orderKey', 'providers', 'inputs', 'outputs'],
    },
    {
      directive: ImportsOrchestratorClassDirective,
      inputs: ['cssClass'],
    },
  ],
})
export class ImportsOrchestratorDirective {}
