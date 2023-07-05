import {
  ComponentRef,
  EventEmitter,
  inject,
  Injectable,
  Injector,
} from '@angular/core';
import { ImportsOrchestratorConfig, Logger } from './config/import.config';
import { findFn, findImportPriority } from './host-directive/util';
import {
  ComponentIO,
  ImportsOrchestratorQueueItemResolveFn,
} from './host-directive';
import { ImportsQueueProcessor } from './queue/imports-queue-processor.service';
import { Observable } from 'rxjs';

export interface ImportLifecycle {
  /**
   * Emits when the import has been added to the queue (not started though). As the [import]-@Input may change, this may emit multiple times.
   */
  importQueued: EventEmitter<void>;

  /**
   * Emits when importing has started. As the [import]-@Input may change, this may emit multiple times.
   */
  importStarted: EventEmitter<void>;

  /**
   * Emits when importing has finished. As the [import]-@Input may change, this may emit multiple times.
   * The emitted value may be void if the import does not yield any components (eg. an NgModule without bootstrap components).
   * Otherwise an array of ComponentRefs is emitted.
   */
  importFinished: EventEmitter<ComponentRef<any>[] | void>;

  /**
   * Emits when importing encounters an error. As the [import]-@Input may change, this may emit multiple times.
   */
  importErrored: EventEmitter<any>;
}

export interface ImportObservableComponentIO {
  readonly inputs$: Observable<ComponentIO>;
  readonly outputs$: Observable<ComponentIO>;
}

export interface ImportServiceOptions {
  lifecycle?: Partial<ImportLifecycle>;
  io?: ImportObservableComponentIO;
  injector: Injector;
  timeout: number;
}

export interface ImportsOrchestratorQueueItem extends ImportServiceOptions {
  import: string;
  resolveFn: ImportsOrchestratorQueueItemResolveFn;
  priority: number;
  logger: Logger;
  destroyComponents$: Observable<void>;
}

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  private readonly queueProcessor = inject(ImportsQueueProcessor);
  private readonly config = inject(ImportsOrchestratorConfig);
  private readonly injector = inject(Injector);
  private readonly logger = this.config.logger;

  public import(
    importId: string,
    destroy$: Observable<void>,
    options: Partial<ImportServiceOptions> = {}
  ): Readonly<ImportsOrchestratorQueueItem> {
    const item = this.createQueueItem(importId, destroy$, {
      ...options,
      injector: options.injector ?? this.injector,
      timeout: options.timeout ?? this.config.timeout,
    });
    return this.addItemToQueue(item);
  }

  public cancel(item: Readonly<ImportsOrchestratorQueueItem>): boolean {
    return this.config.queue.take(item) !== undefined;
  }

  private createQueueItem(
    importId: string,
    destroy$: Observable<void>,
    options: ImportServiceOptions
  ): Readonly<ImportsOrchestratorQueueItem> {
    const resolveFn = findFn(this.config.imports, importId);

    const priority = findImportPriority(
      this.config.orchestration,
      importId,
      this.logger
    );

    return {
      ...options,
      priority,
      import: importId,
      resolveFn,
      logger: this.logger,
      destroyComponents$: destroy$,
    };
  }

  private addItemToQueue(
    item: ImportsOrchestratorQueueItem
  ): Readonly<ImportsOrchestratorQueueItem> {
    this.config.queue.insert(item.priority, item);

    item.lifecycle?.importQueued?.emit();

    this.logger.debug(
      `queue insert @priority=${item.priority}, @import=${item.import}`
    );

    this.queueProcessor.process();
    return item;
  }
}
