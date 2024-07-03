import { inject, Injectable } from '@angular/core';
import {
  DEFER_QUEUE_FEATURE_CONCURRENCY,
  DEFER_QUEUE_FEATURE_LOGGER,
  DEFER_QUEUE_FEATURE_QUEUE,
  DEFER_QUEUE_FEATURE_ROUTING,
} from '../token';
import { wait } from '../util/wait';
import { filter, firstValueFrom, tap } from 'rxjs';
import { DeferQueueItem } from 'defer-queue';

@Injectable({ providedIn: 'root' })
export class DeferQueueProcessor {
  private static processing = false;

  private readonly logger = inject(DEFER_QUEUE_FEATURE_LOGGER);
  private readonly queue = inject(DEFER_QUEUE_FEATURE_QUEUE);
  private readonly isRoutingActive$ = inject(DEFER_QUEUE_FEATURE_ROUTING);
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
    // DO NOT REMOVE, and DO NOT move past wait() statement below
    // this will suspend queue processing while routing is active
    // this is needed to prioritize lazy routes initialization, and items with higher priority resolved when routing
    await this.suspendForNavigation();

    // DO NOT REMOVE
    // this is vital. otherwise the first deferrable view will be added to queue, read the signal, and synchronously write to the signal, causing an exception
    // also, we need to wait a tick so that all deferrables can be added to the queue and sorted by priority (synchronously)
    await wait();
    // ^^

    const concurrency = this.updateConcurrency();
    const concurrentBatch = [];
    for (let i = this.running; i < concurrency; i++) {
      this.running++;

      do {
        const item = this.queue.take();
        concurrentBatch.push(this.processItem(item));
      } while (this.isNextItemTimedout(this.queue.peek()));
      // let's take the next item off the queue
    }
    this.logger.debug(
      `queue starting ${concurrentBatch.length} item(s) to reach max concurrency (concurrency=${concurrency}, running=${this.running})`
    );
    await Promise.all(concurrentBatch);
  }

  private isNextItemTimedout(item: DeferQueueItem | undefined): boolean {
    if (!item) {
      return false;
    }

    const isTimeoutOut = Date.now() - item.timeCreated > item.timeout;
    if (isTimeoutOut) {
      this.logger.warn(
        `timed out queue item, now=${Date.now()} - created=${
          item.timeCreated
        } > timeout=${item.timeout}`
      );
    }

    return isTimeoutOut;
  }

  private async processItem(item: DeferQueueItem | null): Promise<void> {
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
    return typeof this.concurrency === 'function'
      ? this.concurrency()
      : this.concurrency;
  }

  private async suspendForNavigation(): Promise<unknown> {
    // suspend processing while routing, as navigation takes precedence
    return firstValueFrom(
      this.isRoutingActive$.pipe(
        tap((active) => {
          if (active) {
            this.logger.debug('queue processing suspended for navigation');
          }
        }),
        filter((active) => !active)
      )
    );
  }
}
