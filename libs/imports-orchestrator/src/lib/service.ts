import { inject, Injectable, Injector } from '@angular/core';
import { findFn, findImportPriority } from './host-directive/util';
import { ImportsQueueProcessor } from './queue/imports-queue-processor.service';
import { Observable } from 'rxjs';
import { ImportResolveFn } from './resolve';
import { ImportLifecycle, ImportObservableComponentIO } from './interface';

import {
  IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE,
  IMPORTS_ORCHESTRATOR_FEATURE_LOGGER,
  IMPORTS_ORCHESTRATOR_FEATURE_ORCHESTRATION,
  IMPORTS_ORCHESTRATOR_FEATURE_QUEUE,
  IMPORTS_ORCHESTRATOR_FEATURE_TIMEOUT,
} from './internal';
import { ImportsStore } from './features/internal';

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
  logger: Console;
  destroy$: Observable<void>;
  callback?: (result: unknown, err: unknown) => void;
  toString: () => string;
}

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  private readonly queueProcessor = inject(ImportsQueueProcessor);
  private readonly timeout = inject(IMPORTS_ORCHESTRATOR_FEATURE_TIMEOUT);
  private readonly logger = inject(IMPORTS_ORCHESTRATOR_FEATURE_LOGGER);
  private readonly queue = inject(IMPORTS_ORCHESTRATOR_FEATURE_QUEUE);
  private readonly orchestration = inject(
    IMPORTS_ORCHESTRATOR_FEATURE_ORCHESTRATION
  );
  private readonly injector = inject(Injector);

  public createQueueItem(
    identifier: string,
    destroy$: Observable<void>,
    options: Partial<ImportServiceOptions> = {}
  ): Readonly<ImportsOrchestratorQueueItem> {
    const opts: ImportServiceOptions = {
      ...options,
      injector: options.injector ?? this.injector,
      timeout: options.timeout ?? this.timeout,
    };

    const imports = this.importsFromDI(opts.injector);
    const resolveFn = this.resolveFnFromImports(imports, identifier);

    const priority = findImportPriority(
      this.orchestration,
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
      toString: () => `@identifier="${identifier}", @priority=${priority}`,
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

    this.queue.insert(item.priority, item);
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
    return this.queue.take(item) !== undefined;
  }

  private importsFromDI(injector: Injector): ImportsStore {
    try {
      const store = injector.get(IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE);
      return store;
    } catch (x: unknown) {
      throw new Error(`
        Could not inject ${IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE}. Did you \`provideImports({...})\` in a component or module? If you did, you may need to provide an Injector when calling createQueueItem.
        ${x}`);
    }
  }

  private resolveFnFromImports(
    imports: ImportsStore,
    identifier: string
  ): ImportResolveFn {
    try {
      return findFn(imports, identifier);
    } catch (x) {
      throw new Error(`
        Could not find ImportResolveFn. Did you \`provideImports({...})\` in a component or module? If you did, you may need to provide an Injector when calling createQueueItem.
        ${x}`);
    }
  }
}
