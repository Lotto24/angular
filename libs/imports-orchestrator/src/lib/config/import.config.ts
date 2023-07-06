import { Queue } from '../queue/queue';
import { validateOrchestration } from './validate';
import { ImportsOrchestratorQueueItem } from '../import.service';
import {ImportResolveFn} from "@lotto24-angular/imports-orchestrator";

export type Orchestration = {
  [index: string]: number;
};

export type ImportsOrchestrators = {
  [index: string]: string | ImportResolveFn;
};

export type Logger = Pick<Console, 'info' | 'warn' | 'error' | 'debug'>;

export interface AngularImportOrchestratorOptions {
  logger: Logger;
  prefix: string;
  queue: Queue<ImportsOrchestratorQueueItem>;
  parallel: number;
  timeout: number;
}

const importsOrchestratorImports: ImportsOrchestrators = {};

export const IMPORTS_ORCHESTRATOR_IMPORTS: () => ImportsOrchestrators = () =>
  importsOrchestratorImports;

const DEFAULTS: Pick<
  AngularImportOrchestratorOptions,
  'logger' | 'prefix' | 'parallel' | 'timeout'
> = {
  logger: console,
  prefix: 'ImportsOrchestrator',
  parallel: 1,
  timeout: 10000,
};

export class ImportsOrchestratorConfig
  implements AngularImportOrchestratorOptions
{
  public readonly imports = importsOrchestratorImports;
  public parallel = this.options.parallel ?? DEFAULTS.parallel;
  public readonly prefix = this.options.prefix ?? DEFAULTS.prefix;
  public readonly timeout: number = this.options.timeout ?? DEFAULTS.timeout;
  public readonly logger = createLogger(
    this.options.logger ?? DEFAULTS.logger,
    `[${this.prefix}]`
  );

  public readonly queue =
    this.options.queue ?? new Queue<ImportsOrchestratorQueueItem>();

  constructor(
    public readonly orchestration: Orchestration,
    private readonly options: Partial<AngularImportOrchestratorOptions>
  ) {
    validateOrchestration(orchestration, this.logger);
  }
}

function createLogger(logger: Logger, prefix: string): Logger {
  return Object.keys(logger)
    .filter((k) => ['info', 'warn', 'error', 'debug'].includes(k))
    .reduce(
      (r, k) => ({
        ...r,
        [k]: (...rest: any[]) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          logger[k](prefix, ...rest);
        },
      }),
      {} as Logger
    );
}
