import { ImportsOrchestratorConfig } from '../config/import.config';
import { Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { processQueueItem } from './process-queue-item';

@Injectable({ providedIn: 'root' })
export class ImportsQueueProcessor {
  private static processing = false;

  private config = inject(ImportsOrchestratorConfig);
  private logger = this.config.logger;
  private queue = this.config.queue;
  private router = inject(Router);

  private concurrency = 0;
  private running = 0;

  public process(): void {
    if (!ImportsQueueProcessor.processing) {
      // do not await, as it would block the lifecycle callback from completing until the queue is processed
      ImportsQueueProcessor.processing = true;

      this.processQueue()
        .then(() => {
          this.logger.debug('queue processing ended');
        })
        .catch(() => {
          this.logger.debug('queue processing failed');
        })
        .finally(() => {
          ImportsQueueProcessor.processing = false;
        });
    }
  }

  private async processQueue(): Promise<void> {
    const concurrency = this.updateConcurrency();

    const concurrentBatch = [];
    for (let i = this.running; i < concurrency; i++) {
      this.running++;
      concurrentBatch.push(this.processItem());
    }
    this.logger.debug(
      `queue starting ${concurrentBatch.length} item(s) to reach max concurrency (running=${this.running})`
    );
    await Promise.all(concurrentBatch);
  }

  private async processItem(): Promise<void> {
    const item = await processQueueItem(this.config, this.router);
    this.running--;
    if (!this.queue.empty) {
      await this.processQueue();
    }
  }

  private updateConcurrency(): number {
    const value =
      typeof this.config.concurrency === 'function'
        ? this.config.concurrency()
        : this.config.concurrency;

    if (value !== this.concurrency) {
      this.logger.debug(
        `queue concurrency changed to ${value} (previously ${this.concurrency})`
      );
      this.concurrency = value;
    }

    return this.concurrency;
  }
}
