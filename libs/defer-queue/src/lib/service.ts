import { inject, Injectable } from '@angular/core';
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
  logger: ConsoleLike;
  callback?: (result: unknown, err: unknown) => void;
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

  public createQueueItem(
    identifier: string,
    options: Partial<DeferQueueServiceOptions> = {}
  ): Readonly<DeferQueueItem> {
    const opts: DeferQueueServiceOptions = {
      ...options,
      timeout: options.timeout ?? this.timeout,
    };

    const priority = findPriority(this.orchestration, identifier, this.logger);

    return {
      ...opts,
      priority,
      identifier,
      logger: this.logger,
      toString: () => `@identifier="${identifier}", @priority=${priority}`,
    };
  }

  public async addItemToQueue(item: DeferQueueItem): Promise<unknown> {
    const promise = new Promise((resolve, reject) => {
      item.callback = (result, err) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      };
    });

    this.queue.insert(item.priority, item);

    this.logger.debug(`queue insert ${item.toString()}`);

    this.queueProcessor.process();

    return promise;
  }

  public removeItemFromQueue(item: Readonly<DeferQueueItem>): boolean {
    return this.queue.take(item) !== undefined;
  }
}
