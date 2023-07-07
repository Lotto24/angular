import {EnvironmentProviders, makeEnvironmentProviders, Provider,} from '@angular/core';
import {ImportResolveFn} from './resolve';
import {
  IMPORTS_ORCHESTRATOR_IMPORTS,
  ImportsOrchestration,
  ImportsOrchestratorConcurrency,
  ImportsOrchestratorLogger,
  ImportsOrchestratorRouting,
  ImportsOrchestratorTimeout,
} from './features/internal';
import {withConcurrencyStatic, withLogger, withoutRouting, withTimeout} from './features';
import {Queue} from './queue/queue';
import {ImportsOrchestratorQueueItem} from './import.service';
import {withQueue} from './features/queue';
import {withOrchestration} from './features/orchestration';
import {withImportsStore} from './features/imports';

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
    store[key] = imports[key as keyof T] as ImportResolveFn;
  });

  return [];
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
    ...withImportsStore(IMPORTS_ORCHESTRATOR_IMPORTS()).providers,
    ...withOrchestration(orchestration).providers,
  ]);
