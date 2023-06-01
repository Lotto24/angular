import type {AfterViewInit} from '@angular/core';
import {Directive, inject, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {processImportQueue} from '../queue/process-import-queue';
import {ImportConfigProvider} from "../provider/import-config.provider";

@Directive({
  selector: '[importLoader]',
  standalone: true,
})
export class ImportLoaderDirective implements AfterViewInit {
  private static processing = false;

  private config = inject(ImportConfigProvider);
  private router = inject(Router);
  private zone = inject(NgZone);

  public async ngAfterViewInit(): Promise<void> {
    if (!ImportLoaderDirective.processing) {
      ImportLoaderDirective.processing = true;
      this.config.logger.debug('queue processing started');
      this.zone.runOutsideAngular(async () => {
        await processImportQueue(this.config.queue, this.router, this.config.logger);
        ImportLoaderDirective.processing = false;
        this.config.logger.debug('queue processing ended');
      })
    }
  }
}
