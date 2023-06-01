import {Directive} from '@angular/core';

import {ImportLoaderDirective} from './host-directive/import-loader.directive';
import {ImportClassDirective} from "./host-directive/import-class.directive";
import {ImportQueueDirective} from "./host-directive/import-queue.directive";

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
