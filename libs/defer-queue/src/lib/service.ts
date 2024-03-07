import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  DEFER_QUEUE_FEATURE_LOGGER,
  DEFER_QUEUE_FEATURE_ORCHESTRATION,
  DEFER_QUEUE_FEATURE_QUEUE,
  DEFER_QUEUE_FEATURE_TIMEOUT,
} from './token';
import { DeferQueueProcessor } from './queue/defer-queue-processor.service';
import { ConsoleLike } from './interface';
import { findPriority } from './util';

export interface DeferQueueServiceOptions {
  timeout: number;
}

export interface DeferQueueItem extends DeferQueueServiceOptions {
  identifier: string;
  priority: number;
  triggered: WritableSignal<boolean>;
  resolve: (err?: Error) => void;
  resolved: () => Promise<void>;
  logger: ConsoleLike;
  toString: () => string;
}

@Injectable({
  providedIn: 'root',
})
export class DeferQueueService {
  private readonly queueProcessor = inject(DeferQueueProcessor);
  private readonly timeout = inject(DEFER_QUEUE_FEATURE_TIMEOUT);
  private readonly logger = inject(DEFER_QUEUE_FEATURE_LOGGER);
  private readonly queue = inject(DEFER_QUEUE_FEATURE_QUEUE);
  private readonly orchestration = inject(DEFER_QUEUE_FEATURE_ORCHESTRATION);
  private readonly cache: { [identfier: string]: DeferQueueItem } = {};

  public item(
    identifier: string
  ): Pick<DeferQueueItem, 'triggered' | 'resolve'> {
    if (!this.cache[identifier]) {
      const item = this.createQueueItem(identifier);
      this.cache[identifier] = item;
      this.addItemToQueue(item);
      this.queueProcessor.process();
    }

    return this.cache[identifier];
  }

  private createQueueItem(
    identifier: string,
    options: Partial<DeferQueueServiceOptions> = {}
  ): Readonly<DeferQueueItem> {
    const opts: DeferQueueServiceOptions = {
      ...options,
      timeout: options.timeout ?? this.timeout,
    };

    const item: DeferQueueItem = {
      ...opts,
      identifier,
      priority: findPriority(this.orchestration, identifier, this.logger),
      triggered: signal(false),
      logger: this.logger,
      resolve: () => {},
      resolved: () =>
        new Promise<void>((resolve, reject) => {
          item.resolve = (err?: unknown) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          };
          item.triggered.set(true);
        }),
      toString: () =>
        `@identifier="${item.identifier}", @priority=${
          item.priority
        }, triggered=${item.triggered()}`,
    };

    return item;
  }

  private addItemToQueue(item: DeferQueueItem): void {
    this.queue.insert(item.priority, item);
    this.logger.debug(`queue insert ${item.toString()}`);
  }

  public removeItemFromQueue(item: Readonly<DeferQueueItem>): boolean {
    return this.queue.take(item) !== undefined;
  }
}
