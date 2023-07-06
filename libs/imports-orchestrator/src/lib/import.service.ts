import { inject, Injectable, Injector } from '@angular/core';
import { ImportsOrchestratorConfig, Logger } from './config/import.config';
import { findFn, findImportPriority } from './host-directive/util';
import { ImportsQueueProcessor } from './queue/imports-queue-processor.service';
import { Observable } from 'rxjs';
import { ImportResolveFn } from './resolve';
import {
  ImportLifecycle,
  ImportObservableComponentIO,
} from './import.interface';

export interface ImportServiceOptions {
  lifecycle?: Partial<ImportLifecycle>;
  io?: ImportObservableComponentIO;
  injector: Injector;
  timeout: number;
}

export interface ImportsOrchestratorQueueItem extends ImportServiceOptions {
  identifier: string;
  resolveFn: ImportResolveFn;
  priority: number;
  logger: Logger;
  destroy$: Observable<void>;
  callback?: (result: unknown, err: unknown) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  private readonly queueProcessor = inject(ImportsQueueProcessor);
  private readonly config = inject(ImportsOrchestratorConfig);
  private readonly injector = inject(Injector);
  private readonly logger = this.config.logger;

  public createQueueItem(
    identifier: string,
    destroy$: Observable<void>,
    options: Partial<ImportServiceOptions> = {}
  ): Readonly<ImportsOrchestratorQueueItem> {
    const opts: ImportServiceOptions = {
      ...options,
      injector: options.injector ?? this.injector,
      timeout: options.timeout ?? this.config.timeout,
    };

    const resolveFn = findFn(this.config.imports, identifier);

    const priority = findImportPriority(
      this.config.orchestration,
      identifier,
      this.logger
    );

    return {
      ...opts,
      priority,
      identifier,
      resolveFn,
      destroy$,
      logger: this.logger,
    };
  }

  public async addItemToQueue(
    item: ImportsOrchestratorQueueItem
  ): Promise<unknown> {
    const promise = new Promise((resolve, reject) => {
      item.callback = (result, err) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      };
    });

    this.config.queue.insert(item.priority, item);
    item.lifecycle?.importQueued?.emit();

    this.logger.debug(
      `queue insert @priority=${item.priority}, @import=${item.identifier}`
    );

    this.queueProcessor.process();

    return promise;
  }

  public removeItemFromQueue(
    item: Readonly<ImportsOrchestratorQueueItem>
  ): boolean {
    return this.config.queue.take(item) !== undefined;
  }
}
