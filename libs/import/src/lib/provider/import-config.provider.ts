import {Injectable} from "@angular/core";
import {ImportQueueItem, ImportQueueItemResolveFn} from "../host-directive/import-queue.directive";
import {Queue} from "../queue/queue";
import {ImportQueue} from "../queue/import.queue";

export type Orchestration = {
  [index: string]: number;
}
export type Imports = {
  [index: string]: ImportQueueItemResolveFn
}
export type Logger = Pick<Console, 'info' | 'warn' | 'error' | 'debug'>;

export interface AngularImportOrchestratorOptions {
  logger: Logger
  prefix: string
  queue: Queue<ImportQueueItem>
}

const DEFAULTS: Pick<AngularImportOrchestratorOptions, 'logger' | 'prefix'> = {
  logger: console,
  prefix: 'ImportOrchestrator',
}

@Injectable({providedIn: 'any'})
export class ImportConfigProvider {
  private _orchestration: Orchestration = {};
  private _imports: Imports = {};
  private _options!: AngularImportOrchestratorOptions;

  public set options(value: Partial<AngularImportOrchestratorOptions>) {
    const prefix = value.prefix ?? DEFAULTS.prefix
    const logger = createLogger(value.logger ?? DEFAULTS.logger, `[${prefix}]`)
    const queue = value.queue ?? new ImportQueue(logger);

    this._options = {
      prefix,
      logger,
      queue,
    }
  }

  public get orchestration(): Orchestration {
    return this._orchestration;
  }

  public set orchestration(value: Orchestration) {
    this._orchestration = {...this._orchestration, ...value ?? {}};
  }

  public get imports(): Imports {
    return this._imports;
  }

  public set imports(value: Imports) {
    this._imports = {...this._imports, ...value ?? {}};
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
    .filter(k => ['info', 'warn', 'error', 'debug'].includes(k))
    .reduce((r, k) => ({
      ...r,
      [k]: (...rest: any[]) => {
        // @ts-ignore
        logger[k](prefix, ...rest);
      }
    }), {} as Logger)
}
