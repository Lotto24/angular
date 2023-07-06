import {
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrchestratorImportsStore,
  ImportsStore,
} from './internal';
import { Provider } from '@angular/core';
import {IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE} from "../token";

export function withImportsStore(
  importsStore: ImportsStore
): ImportsOrchestratorImportsStore {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE,
      useValue: importsStore,
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.ImportsStore,
    providers
  );
}
