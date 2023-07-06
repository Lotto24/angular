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

} from './host-directive';
import { ImportsQueueProcessor } from './queue/imports-queue-processor.service';
import { Observable } from 'rxjs';
import {ImportResolveFn} from "./resolve";

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
   * The emitted value is whatever is returned as the result of the resolve function
   */
  importFinished: EventEmitter<unknown>;

  /**
   * Emits when importing encounters an error. As the [import]-@Input may change, this may emit multiple times.
   */
  importErrored: EventEmitter<unknown>;

  /**
   * Emits when importing has finished. Emits for every component that was imported.
   * When bootstrapping multiple components, this will emit multiple times
   * Plus, as the [import]-@Input may change, this may emit multiple times for the same component.
   *
   */
  importComponent: EventEmitter<ComponentRef<unknown>>;
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
  resolveFn: ImportResolveFn;
  priority: number;
  logger: Logger;
  destroyComponents$: Observable<void>;
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
    importId: string,
    destroy$: Observable<void>,
    options: Partial<ImportServiceOptions> = {}
  ): Readonly<ImportsOrchestratorQueueItem> {
    const opts: ImportServiceOptions = {
      ...options,
      injector: options.injector ?? this.injector,
      timeout: options.timeout ?? this.config.timeout,
    };

    const resolveFn = findFn(this.config.imports, importId);

    const priority = findImportPriority(
      this.config.orchestration,
      importId,
      this.logger
    );

    return {
      ...opts,
      priority,
      import: importId,
      resolveFn,
      logger: this.logger,
      destroyComponents$: destroy$,
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
      `queue insert @priority=${item.priority}, @import=${item.import}`
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
