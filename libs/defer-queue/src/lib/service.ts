import { inject, Injectable, Injector } from '@angular/core';
import {
  DEFER_QUEUE_FEATURE_LOGGER,
  DEFER_QUEUE_FEATURE_ORCHESTRATION,
  DEFER_QUEUE_FEATURE_QUEUE,
  DEFER_QUEUE_FEATURE_TIMEOUT,
} from './token';
import { DeferQueueProcessor } from './queue/defer-queue-processor.service';
import { ConsoleLike } from './interface';
import { findPriority } from './util';
import { BehaviorSubject, Subject } from 'rxjs';

export interface DeferQueueServiceOptions {
  timeout: number;
}

export interface DeferQueueItem extends DeferQueueServiceOptions {
  identifier: string;
  priority: number;
  triggered: Subject<boolean>;
  resolveFn: (err?: Error) => void;
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
  private readonly injector = inject(Injector);
  private readonly cache: { [identfier: string]: DeferQueueItem } = {};

  public queued(
    identifier: string
  ): Pick<DeferQueueItem, 'triggered' | 'resolveFn'> {
    if (!this.cache[identifier]) {
      const item = this.createQueueItem(identifier);
      this.cache[identifier] = item;
      this.addItemToQueue(item);
    }

    return this.cache[identifier];
  }

  public createQueueItem(
    identifier: string,
    options: Partial<DeferQueueServiceOptions> = {}
  ): Readonly<DeferQueueItem> {
    const opts: DeferQueueServiceOptions = {
      ...options,
      timeout: options.timeout ?? this.timeout,
    };

    const priority = findPriority(this.orchestration, identifier, this.logger);
    const item = {
      ...opts,
      priority,
      identifier,
      triggered: new BehaviorSubject(false),
      logger: this.logger,
      toString: () => `@identifier="${identifier}", @priority=${priority}`,
    } as any;

    item.resolved = () =>
      new Promise<void>((resolve, reject) => {
        item.resolveFn = (err?: unknown) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        };
        item.triggered.next(true);
      });
    return item;
  }

  public addItemToQueue(item: DeferQueueItem): void {
    this.queue.insert(item.priority, item);
    console.log('length=', this.queue.length);
    this.logger.debug(`queue insert ${item.toString()}`);
    this.queueProcessor.process();
  }

  public removeItemFromQueue(item: Readonly<DeferQueueItem>): boolean {
    return this.queue.take(item) !== undefined;
  }
}
