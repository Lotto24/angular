import {
  inject,
  Injectable,
  Injector,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import {
  DEFER_QUEUE_FEATURE_LOGGER,
  DEFER_QUEUE_FEATURE_QUEUE,
  DEFER_QUEUE_FEATURE_TIMEOUT,
} from './token';
import { DeferQueueProcessor } from './queue/defer-queue-processor.service';
import { ConsoleLike } from './interface';
import { defer, Observable } from 'rxjs';

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

export interface DeferQueueWhennable {
  triggered: WritableSignal<boolean>;
  resolve: (err?: Error) => void;
}

export interface DeferQueueItem extends DeferQueueServiceOptions {
  identifier: string;
  priority: DeferQueueItemPriority;
  resolved: () => Promise<unknown>;
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
  private readonly whennablesStore = new Map<string, DeferQueueWhennable>();

  public when(
    identifier: string,
    priority: DeferQueueItemPriority = 'default'
  ): boolean {
    return this.item(identifier, priority).triggered();
  }

  public item(
    identifier: string,
    priority: DeferQueueItemPriority = 'default'
  ): DeferQueueWhennable {
    if (!this.whennablesStore.has(identifier)) {
      const whennable: DeferQueueWhennable = {
        triggered: signal(false),
        resolve: () => {},
      };

      const resolved = () =>
        new Promise<void>((resolve, reject) => {
          whennable.resolve = (err?: unknown) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          };
          whennable.triggered.set(true);
        });

      const item = this.createQueueItem(identifier, priority, resolved);
      this.whennablesStore.set(identifier, whennable);
      this.queue.insert(fromDeferQueueItemPriority(priority), item);
      this.logger.debug(`queue insert ${item.toString()}`);
      this.queueProcessor.process();
    }

    return this.whennablesStore.get(identifier) as DeferQueueWhennable;
  }

  public service<T>(
    identifier: string,
    priority: DeferQueueItemPriority = 'default',
    dynamicImport: () => Promise<Type<T>>
  ): Observable<T> {
    const injector = inject(Injector);

    return defer(() => {
      let fn: (value: T | undefined, err: unknown) => void;
      const promise = new Promise<T>((resolve, reject) => {
        fn = (value: T | undefined, err: unknown) => {
          if (err || !value) {
            reject(err);
          } else {
            resolve(value);
          }
        };
      });

      const resolved = () =>
        dynamicImport()
          .then((service) => injector.get(service))
          .then((instance) => fn(instance, null))
          .catch((err) => fn(undefined, err));

      const item = this.createQueueItem(identifier, priority, resolved);
      this.queue.insert(fromDeferQueueItemPriority(priority), item);
      this.logger.debug(`queue insert ${item.toString()}`);
      this.queueProcessor.process();

      return promise;
    });
  }




  private createQueueItem(
    identifier: string,
    priority: DeferQueueItemPriority,
    resolved: () => Promise<unknown>,
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
      resolved,
      logger: this.logger,
      toString: () =>
        `@identifier="${item.identifier}", @priority=${item.priority}`,
    };

    return item;
  }
}
