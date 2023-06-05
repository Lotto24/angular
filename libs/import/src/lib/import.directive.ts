import {Directive} from '@angular/core';

import {ImportClassDirective, ImportLoaderDirective, ImportQueueDirective} from './host-directive';

@Directive({
  selector: '[import]',
  standalone: true,
  hostDirectives: [
    ImportLoaderDirective,
    {
      directive: ImportQueueDirective,
      inputs: ['import', 'orderKey', 'providers', 'inputs', 'outputs'],
    },
    {
      directive: ImportClassDirective,
      inputs: ['cssClass'],
    }
  ],
})
export class ImportDirective {
}
