import {
  effect,
  inject,
  Injectable,
  Injector,
  Signal,
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
import { defer, Observable, shareReplay, startWith, switchMap } from 'rxjs';

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

export interface DeferQueueDeferrable {
  triggered: WritableSignal<boolean>;
  resolve: (err?: Error) => void;
}

export interface DeferQueueItem extends DeferQueueServiceOptions {
  priority: DeferQueueItemPriority;
  resolved: () => Promise<unknown>;
  logger: ConsoleLike;
}

export interface SignalState<V> {
  value: Signal<V>;
}

export interface ObservableState<V> {
  value$: Observable<V>;
}

@Injectable({
  providedIn: 'root',
})
export class DeferQueueService {
  private readonly queueProcessor = inject(DeferQueueProcessor);
  private readonly timeout = inject(DEFER_QUEUE_FEATURE_TIMEOUT);
  private readonly logger = inject(DEFER_QUEUE_FEATURE_LOGGER);
  private readonly queue = inject(DEFER_QUEUE_FEATURE_QUEUE);
  private readonly deferrables = new Map<string, DeferQueueDeferrable>();

  /**
   * @param identifier is required to connect the resolved item to the defer-trigger
   * @param priority higher priority will resolve the deferrable earlier
   */
  public when(
    identifier: string,
    priority: DeferQueueItemPriority = 'default'
  ) {
    return this.deferrable(identifier, priority).triggered();
  }

  /**
   * Creates a new deferrable queue item, and adds it to the queue. if an item with this identifier already exists, the existing item will be returned.
   * @param identifier is used to connect the resolved item to the defer-trigger
   * @param priority higher priority will resolve the deferrable earlier
   *
   * TODO:
   // *  * add error when resolving an identifier that did not exist previously.
   *  * add error when resolving an identifier that has not been triggered.
   *  *
   */
  public deferrable(
    identifier: string,
    priority: DeferQueueItemPriority = 'default'
  ) {
    if (!this.deferrables.has(identifier)) {
      const deferrable: DeferQueueDeferrable = {
        triggered: signal(false),
        resolve: () => {},
      };

      const resolved = () =>
        new Promise<void>((resolve, reject) => {
          deferrable.resolve = (err?: unknown) => {
            if (err) {
              reject(err);
            } else {
              this.logger.info(
                `queue resolved deferrable w/ identifier=${identifier}, priority=${priority}`
              );
              resolve();
            }
          };
          deferrable.triggered.set(true);
        });

      const item = this.createQueueItem(priority, resolved);
      this.deferrables.set(identifier, deferrable);
      this.queue.insert(fromDeferQueueItemPriority(priority), item);
      this.logger.debug(`queue insert ${item.toString()}`);
      this.queueProcessor.process();
    }

    return this.deferrables.get(identifier) as DeferQueueDeferrable;
  }

  public state<V, T extends SignalState<V>>(
    initialValue: V,
    dynamicImport: () => Promise<Type<T>>,
    priority: DeferQueueItemPriority = 'default',
    injector = inject(Injector)
  ): Signal<V> {
    const value = signal(initialValue);
    this.serviceAsync(dynamicImport, priority, injector).then((service) =>
      effect(() => value.set(service.value()), {
        allowSignalWrites: true,
        injector,
      })
    );

    return value.asReadonly();
  }

  public state$<V, T extends ObservableState<V>>(
    initialValue: V,
    dynamicImport: () => Promise<Type<T>>,
    priority: DeferQueueItemPriority = 'default',
    injector = inject(Injector)
  ): Observable<V> {
    return this.service$(dynamicImport, priority, injector).pipe(
      switchMap((service) => service.value$),
      startWith(initialValue),
      shareReplay(1)
    );
  }

  public service$<T>(
    dynamicImport: () => Promise<Type<T>>,
    priority: DeferQueueItemPriority = 'default',
    injector = inject(Injector)
  ) {
    return defer(this.serviceItem(dynamicImport, priority, injector));
  }

  public async serviceAsync<T>(
    dynamicImport: () => Promise<Type<T>>,
    priority: DeferQueueItemPriority = 'default',
    injector = inject(Injector)
  ) {
    return this.serviceItem(dynamicImport, priority, injector)();
  }

  public service<T>(
    dynamicImport: () => Promise<Type<T>>,
    priority: DeferQueueItemPriority = 'default',
    injector = inject(Injector)
  ): Signal<T | null> {
    const s = signal<T | null>(null);
    this.serviceAsync(dynamicImport, priority, injector).then((service) =>
      s.set(service)
    );

    return s;
  }

  private serviceItem<T>(
    dynamicImport: () => Promise<Type<T>>,
    priority: DeferQueueItemPriority = 'default',
    injector: Injector
  ) {
    return () => {
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
          .then((service) => {
            this.logger.info(
              `queue resolved service w/ name=${service.name}, priority=${priority}`
            );
            return service;
          })
          .then((service) => injector.get(service))
          .then((instance) => fn(instance, null))
          .catch((err) => fn(undefined, err));

      const item = this.createQueueItem(priority, resolved);
      this.queue.insert(fromDeferQueueItemPriority(priority), item);
      this.logger.debug(`queue insert ${item.toString()}`);
      this.queueProcessor.process();

      return promise;
    };
  }

  private createQueueItem(
    priority: DeferQueueItemPriority,
    resolved: () => Promise<unknown>,
    options: Partial<DeferQueueServiceOptions> = {}
  ): Readonly<DeferQueueItem> {
    const opts: DeferQueueServiceOptions = {
      ...options,
      timeout: options.timeout ?? this.timeout,
    };

    return {
      ...opts,
      priority,
      resolved,
      logger: this.logger,
    };
  }
}
