import { Directive } from '@angular/core';

import { ImportLoaderDirective } from './import-loader.directive';

@Directive({
  selector: '[import]',
  standalone: true,
  hostDirectives: [ImportLoaderDirective],
})
export class ImportDirective {}
