import {
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrchestratorInterceptor,
} from './internal';
import { Provider } from '@angular/core';
import { IMPORTS_ORCHESTRATOR_FEATURE_INTERCEPTOR } from '../internal';
import { ImportsInterceptor } from '../interface';

export function withInterceptor(
  interceptor: ImportsInterceptor
): ImportsOrchestratorInterceptor {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_INTERCEPTOR,
      useValue: interceptor,
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Interceptor,
    providers
  );
}
