import type { AfterViewInit } from '@angular/core';
import { Directive, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { processImportQueue as processImportItem } from '../queue/process-import-queue';
import { ImportsOrchestratorConfig } from '../config/import.config';

@Directive({
  selector: '[importLoader]',
  standalone: true,
})
export class ImportsOrchestratorLoaderDirective implements AfterViewInit {
  private static processing = false;

  private config = inject(ImportsOrchestratorConfig);
  private router = inject(Router);
  private zone = inject(NgZone);

  public async ngAfterViewInit(): Promise<void> {
    if (!ImportsOrchestratorLoaderDirective.processing) {
      // do not await, as it would block the lifecycle callback from completing until the queue is processed
      ImportsOrchestratorLoaderDirective.processing = true;
      let item = 0;
      let concurrent = 0;

      while (this.config.queue.length > 0) {
        const currentBatch = [];
        for (let i = concurrent; i < this.config.parallel; i++) {
          currentBatch.push(
            processImportItem(item++, this.config, this.router).then(() => {
              this.config.logger.debug(`Queue resolved item, concurrent now ${concurrent}`);
            }).finally(() => {
              concurrent--;
            })
          );
        }
        concurrent += currentBatch.length;
        this.config.logger.debug(`Queue started batch with ${currentBatch.length} items, concurrency now ${concurrent}`);
        await Promise.any(currentBatch);
      }

      ImportsOrchestratorLoaderDirective.processing = false;
      this.config.logger.debug('queue processing ended');
    }
  }
}
