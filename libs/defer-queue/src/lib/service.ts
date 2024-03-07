import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  DEFER_QUEUE_FEATURE_LOGGER,
  DEFER_QUEUE_FEATURE_QUEUE,
  DEFER_QUEUE_FEATURE_TIMEOUT,
} from './token';
import { DeferQueueProcessor } from './queue/defer-queue-processor.service';
import { ConsoleLike } from './interface';

export interface DeferQueueServiceOptions {
  timeout: number;
}

const DEFER_QUEUE_ITEM_PRIORITIES = {
  highest: 999_999_999,
  high: 999_999,
  default: 100_000,
  low: 10_000,
  lowest: 1_000,
} as const;

export type DeferQueueItemPriority =
  | keyof typeof DEFER_QUEUE_ITEM_PRIORITIES
  | number;

function fromDeferQueueItemPriority(priority: DeferQueueItemPriority): number {
  if (typeof priority === 'number') {
    return priority;
  }

  return (
    DEFER_QUEUE_ITEM_PRIORITIES[priority] ?? DEFER_QUEUE_ITEM_PRIORITIES.default
  );
}

export interface DeferQueueItem extends DeferQueueServiceOptions {
  identifier: string;
  priority: DeferQueueItemPriority;
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
  // private readonly orchestration = inject(DEFER_QUEUE_FEATURE_ORCHESTRATION);
  private readonly cache: { [identfier: string]: DeferQueueItem } = {};

  public item(
    identifier: string,
    priority: DeferQueueItemPriority = 'default'
  ): Pick<DeferQueueItem, 'triggered' | 'resolve'> {
    if (!this.cache[identifier]) {
      const item = this.createQueueItem(identifier, priority);
      this.cache[identifier] = item;
      this.addItemToQueue(item);
      this.queueProcessor.process();
    }

    return this.cache[identifier];
  }

  private createQueueItem(
    identifier: string,
    priority: DeferQueueItemPriority,
    options: Partial<DeferQueueServiceOptions> = {}
  ): Readonly<DeferQueueItem> {
    const opts: DeferQueueServiceOptions = {
      ...options,
      timeout: options.timeout ?? this.timeout,
    };

    const item: DeferQueueItem = {
      ...opts,
      identifier,
      priority,
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
    this.queue.insert(fromDeferQueueItemPriority(item.priority), item);
    this.logger.debug(`queue insert ${item.toString()}`);
  }

  public removeItemFromQueue(item: Readonly<DeferQueueItem>): boolean {
    return this.queue.take(item) !== undefined;
  }
}
