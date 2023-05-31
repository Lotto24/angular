import type { AfterViewInit } from '@angular/core';
import {Directive, ElementRef, NgZone} from '@angular/core';
import { Router } from '@angular/router';

import { ImportQueueDirective } from './import-queue.directive';
import { ImportQueueProvider } from './import-queue.provider';
import { logger } from './util/logger';
import { processImportQueue } from './process-import-queue';

@Directive({
  selector: '[importLoader]',
  standalone: true,
})
export class ImportLoaderDirective implements AfterViewInit {
  private static processing = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private queue: ImportQueueProvider,
    private router: Router,
    private zone: NgZone
  ) {}

  public async ngAfterViewInit(): Promise<void> {
    if (!ImportLoaderDirective.processing) {
      ImportLoaderDirective.processing = true;
      logger.debug('queue processing started');
      this.zone.runOutsideAngular(async () => {
        await processImportQueue(this.queue, this.router);
        ImportLoaderDirective.processing = false;
        logger.debug('queue processing ended');
      })
    }
  }
}
