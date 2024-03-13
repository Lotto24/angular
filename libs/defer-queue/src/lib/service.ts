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
export class DeferQueueService {
  private readonly queueProcessor = inject(DeferQueueProcessor);
  private readonly timeout = inject(DEFER_QUEUE_FEATURE_TIMEOUT);
  private readonly logger = inject(DEFER_QUEUE_FEATURE_LOGGER);
  private readonly queue = inject(DEFER_QUEUE_FEATURE_QUEUE);
  private readonly deferrableStore = new Map<string, DeferQueueDeferrable>();

  public deferrables() {
    const injector = inject(Injector);
    const destroyRef = injector.get(DestroyRef);

    destroyRef.onDestroy(() => this.logger.info('onDestroy'));

    return {
      when: (
        identfier: string,
        priority: DeferQueueItemPriority = 'default'
      ) => {
        const deferrable = this.deferrable(identfier, priority);
        destroyRef.onDestroy(() => deferrable.resolve());
        return deferrable;
      },
    };
  }

  public services() {

  }

  /**
   * @param identifier is required to connect the resolved item to the defer-trigger
   * @param priority higher priority will resolve the deferrable earlier
   */
  private when(
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
    if (!this.deferrableStore.has(identifier)) {
      const deferrable: DeferQueueDeferrable = {
        triggered: signal(false),
        resolve: () => {
          const taken = this.queue.take(item);
          this.logger.info(
            `resolved deferrable w/ identifier=${identifier}, priority=${priority}`
          );
        },
      };

      const resolved = () =>
        new Promise<void>((resolve, reject) => {
          deferrable.resolve = (err?: unknown) => {
            if (err) {
              reject(err);
            } else {
              this.logger.info(
                `resolved deferrable w/ identifier=${identifier}, priority=${priority}`
              );
              resolve();
            }
          };
          deferrable.triggered.set(true);
        });

      const item = this.createQueueItem(priority, resolved);
      this.deferrableStore.set(identifier, deferrable);
      this.queue.insert(fromDeferQueueItemPriority(priority), item);
      this.logger.debug(
        `insert deferrable w/ identifier=${identifier}, ${priority}`
      );
      this.logger.info('queue.length', this.queue.length);
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
