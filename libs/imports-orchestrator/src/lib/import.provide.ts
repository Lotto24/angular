import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  Provider,
} from '@angular/core';
import { ImportsOrchestratorQueueItemResolveFn } from './host-directive';
import {
  ANGULAR_IMPORTS_ORCHESTRATOR_IMPORTS,
  AngularImportOrchestratorOptions,
  ImportsOrchestratorConfig,
  Orchestration,
} from './config/import.config';

export function provideImports<T>(
  imports: Partial<{ [key in keyof T]: ImportsOrchestratorQueueItemResolveFn }>
): Provider {
  return {
    provide: ANGULAR_IMPORTS_ORCHESTRATOR_IMPORTS,
    useValue: imports,
  };
}

export function provideImportsOrchestration<T>(
  orchestration: T & Orchestration,
  options?: Partial<AngularImportOrchestratorOptions>
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ImportsOrchestratorConfig,
      useFactory: () =>
        new ImportsOrchestratorConfig(orchestration, options ?? {}),
    },
  ]);
}
