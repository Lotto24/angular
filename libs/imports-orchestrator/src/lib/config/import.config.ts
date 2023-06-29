import {
  ImportsOrchestratorQueueItem,
  ImportsOrchestratorQueueItemResolveFn,
} from '../host-directive';
import { Queue } from '../queue/queue';

export type Orchestration = {
  [index: string]: number;
};

export type ImportsOrchestrators = {
  [index: string]: ImportsOrchestratorQueueItemResolveFn;
};

export type Logger = Pick<Console, 'info' | 'warn' | 'error' | 'debug'>;

export interface AngularImportOrchestratorOptions {
  logger: Logger;
  prefix: string;
  queue: Queue<ImportsOrchestratorQueueItem>;
  parallel: number;
}

let importsOrchestratorImports: ImportsOrchestrators = {};

export const IMPORTS_ORCHESTRATOR_IMPORTS: () => ImportsOrchestrators = () =>
  importsOrchestratorImports;

const DEFAULTS: Pick<
  AngularImportOrchestratorOptions,
  'logger' | 'prefix' | 'parallel'
> = {
  logger: console,
  prefix: 'ImportsOrchestrator',
  parallel: 1,
};

export class ImportsOrchestratorConfig
  implements AngularImportOrchestratorOptions
{
  public readonly imports = importsOrchestratorImports;
  public parallel = this.options.parallel ?? DEFAULTS.parallel;
  public readonly prefix = this.options.prefix ?? DEFAULTS.prefix;
  public readonly logger = createLogger(
    this.options.logger ?? DEFAULTS.logger,
    `[${this.prefix}]`
  );

  public readonly queue =
    this.options.queue ?? new Queue<ImportsOrchestratorQueueItem>();

  constructor(
    public readonly orchestration: Orchestration,
    private readonly options: Partial<AngularImportOrchestratorOptions>
  ) {}
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
