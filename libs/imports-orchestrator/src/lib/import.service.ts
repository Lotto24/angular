import {
  ComponentRef,
  EventEmitter,
  inject,
  Injectable,
  Injector,
} from '@angular/core';
import { ImportsOrchestratorConfig } from './config/import.config';
import { findFn, findImportPriority } from './host-directive/util';
import {
  ImportsOrchestratorLifecycleDirective,
  ImportsOrchestratorQueueItem,
} from './host-directive';
import { ImportsQueueProcessor } from './queue/imports-queue-processor.service';

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

interface ImportServiceOptions {
  lifecycle?: ImportLifecycle;
  injector?: Injector;
  timeout?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  private readonly queueProcessor = inject(ImportsQueueProcessor);
  private readonly config = inject(ImportsOrchestratorConfig);
  private readonly injector = inject(Injector);
  private readonly logger = this.config.logger;

  public import(importId: string, options: ImportServiceOptions): void {
    const timeout = options.timeout ?? this.config.timeout;
    const injector = options.injector ?? this.injector;
    const lifecycle = new ImportsOrchestratorLifecycleDirective();
    const item = this.createQueueItem(importId, injector, lifecycle, timeout);

    this.addItemToQueue(item);
  }

  private createQueueItem(
    importId: string,
    injector: Injector,
    lifecycle: ImportLifecycle,
    timeout: number
  ): ImportsOrchestratorQueueItem {
    const resolveFn = findFn(this.config.imports, importId);

    const priority = findImportPriority(
      this.config.orchestration,
      importId,
      this.logger
    );

    return {
      import: importId,
      logger: this.logger,
      lifecycle,
      resolveFn,
      timeout,
      injector,
      priority,
    };
  }

  private addItemToQueue(item: ImportsOrchestratorQueueItem): void {
    this.config.queue.insert(item.priority, item);

    item.lifecycle.importQueued.emit();

    this.logger.debug(
      `queue insert @priority=${item.priority}, @import=${this.import}`
    );

    this.queueProcessor.process();
  }
}
