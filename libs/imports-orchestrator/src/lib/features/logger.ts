import { Provider } from '@angular/core';
import {
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrchestratorLogger,
} from './internal';
import { IMPORTS_ORCHESTRATOR_FEATURE_LOGGER } from '../internal';

export type ConsoleLike = Pick<Console, 'info' | 'warn' | 'error' | 'debug'>;

export function withLogger(logger: ConsoleLike): ImportsOrchestratorLogger {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_LOGGER,
      useValue: logger,
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Logger,
    providers
  );
}
