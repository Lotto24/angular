import {
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrchestratorTimeout,
} from './internal';
import { Provider } from '@angular/core';
import {IMPORTS_ORCHESTRATOR_FEATURE_TIMEOUT} from "../internal";

export function withTimeout(timeout: number = 10000): ImportsOrchestratorTimeout {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_TIMEOUT,
      useValue: timeout,
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Timeout,
    providers
  );
}
