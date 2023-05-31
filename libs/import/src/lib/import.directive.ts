import {Directive} from '@angular/core';

import {ImportLoaderDirective} from './import-loader.directive';
import {ImportClassDirective} from "./import-class.directive";
import {ImportQueueDirective} from "./import-queue.directive";

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
      inputs: ['withClass'],
    }
  ],
})
export class ImportDirective {
}
