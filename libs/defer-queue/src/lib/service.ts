import {
  DestroyRef,
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
import { DeferQueueItemPriority, fromDeferQueueItemPriority } from './util';

export interface DeferQueueServiceOptions {
  timeout: number;
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
export class DeferQueue {
  private readonly queueProcessor = inject(DeferQueueProcessor);
  private readonly timeout = inject(DEFER_QUEUE_FEATURE_TIMEOUT);
  private readonly logger = inject(DEFER_QUEUE_FEATURE_LOGGER);
  private readonly queue = inject(DEFER_QUEUE_FEATURE_QUEUE);
  private readonly deferrableStore = new Map<string, DeferQueueDeferrable>();

  public get view() {
    let destroyRef: DestroyRef;
    try {
      destroyRef = inject(Injector).get(DestroyRef);
    } catch (x) {
      throw new Error(
        `injector context required: please do not reference this property directly from a template, but expose it on your component, eg. "protected readonly view = inject(DeferQueueService).view", ${x}`
      );
    }

    return {
      when: this.when(destroyRef).bind(this),
      resolve: this.resolve.bind(this),
    };
  }

  private when(destroyRef: DestroyRef) {
    return (
      identifier: string,
      priority: DeferQueueItemPriority = 'default'
    ) => {
      const deferrable = this.deferrable(identifier, priority);
      destroyRef.onDestroy(() => {
        this.logger.debug(
          `resolving deferrable w/ identifier=${identifier} because injection context was destroyed`
        );
        deferrable.resolve();
      });
      return deferrable.triggered();
    };
  }

  private resolve(identifier: string, err?: Error | undefined): void {
    const deferrable = this.deferrableStore.get(identifier);
    if (deferrable) {
      deferrable.resolve(err);
    } else {
      this.logger.error(`could not resolve identifier=${identifier}`);
    }
  }

  /**
   * Creates a new deferrable queue item, and adds it to the queue. if an item with this identifier already exists, the existing item will be returned.
   * @param identifier is used to connect the resolved item to the defer-trigger
   * @param priority higher priority will resolve the deferrable earlier
   *
   */
  private deferrable(
    identifier: string,
    priority: DeferQueueItemPriority = 'default'
  ) {
    if (!this.deferrableStore.has(identifier)) {
      const deferrable: DeferQueueDeferrable = {
        triggered: signal(false),
        resolve: () => {
          const taken = this.queue.take(item);
          this.logger.info(
            `removed deferrable (taken? ${!!taken} w/ identifier=${identifier}, priority=${priority}`
          );
        },
      };

      const resolved = () =>
        new Promise<void>((resolve, reject) => {
          deferrable.resolve = (err?: unknown) => {
            if (err) {
              reject(err);
            } else {
              resolve();
              this.logger.info(
                `resolved deferrable w/ identifier=${identifier}, priority=${priority}`
              );
            }
          };
          deferrable.triggered.set(true);
        });

      const item = this.createQueueItem(priority, resolved);
      this.deferrableStore.set(identifier, deferrable);
      this.logger.debug(
        `insert deferrable w/ identifier=${identifier}, ${priority}`
      );
      this.queue.insert(fromDeferQueueItemPriority(priority), item);
      this.queueProcessor.process();
    }

    return this.deferrableStore.get(identifier) as DeferQueueDeferrable;
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
              `resolved service w/ name=${service.name}, priority=${priority}`
            );
            return service;
          })
          .then((service) => injector.get(service))
          .then((instance) => fn(instance, null))
          .catch((err) => fn(undefined, err));

      const item = this.createQueueItem(priority, resolved);
      this.queue.insert(fromDeferQueueItemPriority(priority), item);
      this.logger.debug(`insert service`);
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
