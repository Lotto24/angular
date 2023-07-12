import { Provider } from '@angular/core';
import {
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrchestratorLogger,
} from './internal';
import { IMPORTS_ORCHESTRATOR_FEATURE_LOGGER } from '../internal';

export function withLogger(
  logger: Console,
  prefix: string = '[ImportsOrchestrator]'
): ImportsOrchestratorLogger {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_LOGGER,
      useValue: createLogger(logger, prefix),
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Logger,
    providers
  );
}

function createLogger(
  logger: Console,
  prefix: string
): ImportsOrchestratorLogger {
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
      {} as ImportsOrchestratorLogger
    );
}
