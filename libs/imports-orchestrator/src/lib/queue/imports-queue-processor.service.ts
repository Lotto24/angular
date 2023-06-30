import { ImportsOrchestratorConfig } from '../config/import.config';
import { Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { processQueueItem } from './process-queue-item';

@Injectable({ providedIn: 'root' })
export class ImportsQueueProcessor {
  private static processing = false;

  private config = inject(ImportsOrchestratorConfig);
  private router = inject(Router);

  private running = 0;

  public process(): void {
    if (!ImportsQueueProcessor.processing) {
      // do not await, as it would block the lifecycle callback from completing until the queue is processed
      ImportsQueueProcessor.processing = true;

      this.processQueue()
        .then(() => {
          this.config.logger.debug('queue processing ended');
        })
        .catch(() => {
          this.config.logger.debug('queue processing failed');
        })
        .finally(() => {
          ImportsQueueProcessor.processing = false;
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
    await processQueueItem(pid++, this.config, this.router);
    this.running--;
    this.config.logger.debug(
      `Queue item resolved, concurrent now ${this.running}`
    );
    if (this.config.queue.length !== 0) {
      await this.processQueue(pid++);
    }
  }
}
