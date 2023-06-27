import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  Provider,
} from '@angular/core';
import { ImportsOrchestratorQueueItemResolveFn } from './host-directive';
import {
  AngularImportOrchestratorOptions,
  IMPORTS_ORCHESTRATOR_IMPORTS,
  ImportsOrchestratorConfig,
  Orchestration,
} from './config/import.config';

export const provideImports = <T>(
  imports: Partial<{ [key in keyof T]: ImportsOrchestratorQueueItemResolveFn }>
): Provider[] => {
  const store = IMPORTS_ORCHESTRATOR_IMPORTS();

  Object.keys(imports).forEach((key) => {
    store[key] = imports[
      key as keyof T
    ] as ImportsOrchestratorQueueItemResolveFn;
  });

  return [];
};

export const provideImportsOrchestration = <T>(
  orchestration: T & Orchestration,
  options?: Partial<AngularImportOrchestratorOptions>
): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: ImportsOrchestratorConfig,
      useFactory: () =>
        new ImportsOrchestratorConfig(orchestration, options ?? {}),
    },
  ]);
