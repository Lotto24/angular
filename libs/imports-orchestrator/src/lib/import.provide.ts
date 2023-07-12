import {EnvironmentProviders, makeEnvironmentProviders, Provider,} from '@angular/core';
import {ImportResolveFn} from './resolve';
import {
  ImportsOrchestration,
  ImportsOrchestratorConcurrency,
  ImportsOrchestratorLogger,
  ImportsOrchestratorRouting,
  ImportsOrchestratorTimeout,
  ImportsStore,
} from './features/internal';
import {withConcurrencyStatic, withLogger, withoutRouting, withTimeout,} from './features';
import {Queue} from './queue/queue';
import {ImportsOrchestratorQueueItem} from './import.service';
import {withQueue} from './features/queue';
import {withOrchestration} from './features/orchestration';
import {
  IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE,
  IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE_GLOBAL,
  IMPORTS_STORE,
} from './token';

/**
 * @param imports
 *
 * @example
 * {
 *   'componentA': importStandalone(() => import('my/package/componentA')),
 *   'componentB': 'componentA' // Alias, for reusing the same import
 * }
 */
export const provideImports = <T extends ImportsOrchestration>(
  imports: Partial<{
    [key in keyof T]: keyof T | ImportResolveFn;
  }>
): Provider[] => {
  const store = IMPORTS_STORE;
  Object.entries(imports).forEach(([key, value]) => {
    store[key] = value as ImportResolveFn;
  });

  return [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE,
      useFactory: (globalImports: ImportsStore) => {
        return store;
        // Object.entries(imports).forEach(([key, value]) => {
        //   globalImports[key] = value as ImportResolveFn;
        // });
        // return globalImports;
      },
      multi: true,
      deps: [IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE_GLOBAL],
    },
  ];
};

export type ImportsOrchestratorFeatures =
  | ImportsOrchestratorRouting
  | ImportsOrchestratorConcurrency
  | ImportsOrchestratorTimeout
  | ImportsOrchestratorLogger;

export const provideImportsOrchestration = <T>(
  orchestration: T & ImportsOrchestration,
  ...features: ImportsOrchestratorFeatures[]
): EnvironmentProviders =>
  makeEnvironmentProviders([
    // default values:
    ...[
      withoutRouting(),
      withConcurrencyStatic(2),
      withLogger(console),
      withTimeout(10000),
      withQueue(new Queue<ImportsOrchestratorQueueItem>()),
    ].map((feature) => feature.providers),
    // configured values from features
    ...(features || []).map((feature) => feature.providers),
    ...withOrchestration(orchestration).providers,
  ]);
