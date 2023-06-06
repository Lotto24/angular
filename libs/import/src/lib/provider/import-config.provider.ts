import { ImportQueueItem, ImportQueueItemResolveFn } from '../host-directive';
import { Queue } from '../queue/queue';
import { ImportQueue } from '../queue/import.queue';
import { InjectionToken } from '@angular/core';

export type Orchestration = {
  [index: string]: number;
};

export type Imports = {
  [index: string]: ImportQueueItemResolveFn;
};

export type Logger = Pick<Console, 'info' | 'warn' | 'error' | 'debug'>;

export interface AngularImportOrchestratorOptions {
  logger: Logger;
  prefix: string;
  queue: Queue<ImportQueueItem>;
}

export const ANGULAR_IMPORTS_ORCHESTRATOR_IMPORTS = new InjectionToken<Imports>(
  'ANGULAR_IMPORTS_ORCHESTRATOR_IMPORTS'
);

const DEFAULTS: Pick<AngularImportOrchestratorOptions, 'logger' | 'prefix'> = {
  logger: console,
  prefix: 'ImportOrchestrator',
};

export class ImportConfigProvider {
  private _options!: AngularImportOrchestratorOptions;

  constructor(
    public readonly orchestration: Orchestration,
    options: Partial<AngularImportOrchestratorOptions>
  ) {
    this.options = options;
  }

  private set options(value: Partial<AngularImportOrchestratorOptions>) {
    const prefix = value.prefix ?? DEFAULTS.prefix;
    const logger = createLogger(value.logger ?? DEFAULTS.logger, `[${prefix}]`);
    const queue = value.queue ?? new ImportQueue(logger);

    this._options = {
      prefix,
      logger,
      queue,
    };
  }

  public get logger(): Logger {
    return this._options.logger;
  }

  public get queue(): Queue<ImportQueueItem> {
    return this._options.queue;
  }
}

function createLogger(logger: Logger, prefix: string): Logger {
  return Object.keys(logger)
    .filter((k) => ['info', 'warn', 'error', 'debug'].includes(k))
    .reduce(
      (r, k) => ({
        ...r,
        [k]: (...rest: any[]) => {
          // @ts-ignore
          logger[k](prefix, ...rest);
        },
      }),
      {} as Logger
    );
}
