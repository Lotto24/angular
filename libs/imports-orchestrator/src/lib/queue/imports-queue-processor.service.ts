import { inject, Injectable } from '@angular/core';
import { processQueueItem } from './process-queue-item';
import {
  IMPORTS_ORCHESTRATOR_FEATURE_CONCURRENCY,
  IMPORTS_ORCHESTRATOR_FEATURE_LOGGER,
  IMPORTS_ORCHESTRATOR_FEATURE_QUEUE,
  IMPORTS_ORCHESTRATOR_FEATURE_ROUTING,
} from '../internal';
import { filter, firstValueFrom, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImportsQueueProcessor {
  private static processing = false;

  private readonly logger = inject(IMPORTS_ORCHESTRATOR_FEATURE_LOGGER);
  private readonly queue = inject(IMPORTS_ORCHESTRATOR_FEATURE_QUEUE);
  private readonly isRoutingActive$ = inject(
    IMPORTS_ORCHESTRATOR_FEATURE_ROUTING
  );
  private readonly concurrency = inject(
    IMPORTS_ORCHESTRATOR_FEATURE_CONCURRENCY
  );

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
    await this.suspendForNavigation();

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
