import { inject, Injectable } from '@angular/core';
import {
  DEFER_QUEUE_FEATURE_CONCURRENCY,
  DEFER_QUEUE_FEATURE_LOGGER,
  DEFER_QUEUE_FEATURE_QUEUE,
} from '../token';
import {processQueueItem} from "./process-queue-item";

@Injectable({ providedIn: 'root' })
export class DeferQueueProcessor {
  private static processing = false;

  private readonly logger = inject(DEFER_QUEUE_FEATURE_LOGGER);
  private readonly queue = inject(DEFER_QUEUE_FEATURE_QUEUE);
  private readonly concurrency = inject(DEFER_QUEUE_FEATURE_CONCURRENCY);

  private running = 0;

  public process(): void {
    if (!DeferQueueProcessor.processing) {
      // do not await, as it would block the lifecycle callback from completing until the queue is processed
      DeferQueueProcessor.processing = true;

      this.processQueue()
        .then(() => {
          this.logger.debug('queue processing ended');
        })
        .catch(() => {
          this.logger.debug('queue processing failed');
        })
        .finally(() => {
          DeferQueueProcessor.processing = false;
        });
    }
  }

  private async processQueue(): Promise<void> {
    // await this.suspendForNavigation();

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
    await processQueueItem(this.queue, this.logger);
    this.running--;
    if (!this.queue.empty) {
      await this.processQueue();
    }
  }

  private updateConcurrency(): number {
    const value =
      typeof this.concurrency === 'function'
        ? this.concurrency()
        : this.concurrency;

    if (value !== this.concurrency) {
      this.logger.debug(`queue concurrency changed to ${value}`);
    }

    return value;
  }
}
