import { inject, Injectable } from '@angular/core';
import {
  DEFER_QUEUE_FEATURE_CONCURRENCY,
  DEFER_QUEUE_FEATURE_LOGGER,
  DEFER_QUEUE_FEATURE_QUEUE,
} from '../token';
import { wait } from '../util/wait';

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

    // DO NOT REMOVE
    // this is vital. otherwise the first deferrable view will be added to queue, read the signal, and synchronously write to the signal, causing an exception
    // also, we need to wait a tick so that all deferrables can be added to the queue and sorted by priority (synchronously)
    await wait();
    // ^^

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
    // let's take the next item off the queue
    const item = this.queue.take();

    // let's stop if there are no items in the queue
    if (!item) {
      this.logger.debug('queue is drained');
      return;
    }

    try {
      await item.resolved();
    } catch (x) {
      this.logger.error(`error resolving queue item (${item})`, x);
    }

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
