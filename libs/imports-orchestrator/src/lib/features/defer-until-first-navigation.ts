import { Provider } from '@angular/core';
import {
  DeferUntilFirstNavigation,
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
} from './internal';
import {IMPORTS_ORCHESTRATOR_FEATURE_DEFER_UNTIL_FIRST_NAVIGATION} from "../token";

export function withDeferUntilFirstNavigation(value = true): DeferUntilFirstNavigation {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_DEFER_UNTIL_FIRST_NAVIGATION,
      useValue: value,
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.DeferUntilFirstNavigation,
    providers
  );
}
