import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  Provider,
} from '@angular/core';
import {
  AngularImportOrchestratorOptions,
  IMPORTS_ORCHESTRATOR_IMPORTS,
  ImportsOrchestratorConfig,
  Orchestration,
} from './config/import.config';
import {ImportResolveFn} from "./resolve";

/**
 * @param imports
 *
 * @example
 * {
 *   'componentA': importStandalone(() => import('my/package/componentA')),
 *   'componentB': 'componentA' // Alias, for reusing the same import
 * }
 */
export const provideImports = <T>(
  imports: Partial<{
    [key in keyof T]: keyof T | ImportResolveFn;
  }>
): Provider[] => {
  const store = IMPORTS_ORCHESTRATOR_IMPORTS();

  Object.keys(imports).forEach((key) => {
    store[key] = imports[
      key as keyof T
    ] as ImportResolveFn;
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
