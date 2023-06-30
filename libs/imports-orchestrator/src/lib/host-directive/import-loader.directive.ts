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

  private running = 0;

  public ngAfterViewInit(): void {
    if (!ImportsOrchestratorLoaderDirective.processing) {
      // do not await, as it would block the lifecycle callback from completing until the queue is processed
      ImportsOrchestratorLoaderDirective.processing = true;

      this.processQueue()
        .then(() => {
          this.config.logger.debug('queue processing ended');
        })
        .catch(() => {
          this.config.logger.debug('queue processing failed');
        })
        .finally(() => {
          ImportsOrchestratorLoaderDirective.processing = false;
        });
    }
  }

  private async processQueue(pid: number = 0): Promise<void> {
    const concurrentBatch = [];
    for (let i = this.running; i < this.config.parallel; i++) {
      this.running++;
      concurrentBatch.push(this.processItemAndContinueQueue(pid++));
    }
    this.config.logger.debug(
      `Queue starting ${concurrentBatch.length} item(s) to reach max parallel, concurrent now ${this.running}`
    );
    await Promise.all(concurrentBatch);
  }

  private async processItemAndContinueQueue(pid: number): Promise<void> {
    await processImportItem(pid++, this.config, this.router);
    this.running--;
    this.config.logger.debug(
      `Queue item resolved, concurrent now ${this.running}`
    );
    if (this.config.queue.length !== 0) {
      await this.processQueue(pid++);
    }
  }
}
