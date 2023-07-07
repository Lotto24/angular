import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  Provider,
} from '@angular/core';
import { ImportResolveFn } from './resolve';
import {
  ImportsOrchestration,
  ImportsOrchestratorConcurrency,
  ImportsOrchestratorLogger,
  ImportsOrchestratorRouting,
  ImportsOrchestratorTimeout,
} from './features/internal';
import {
  withConcurrencyStatic,
  withLogger,
  withoutRouting,
  withTimeout,
} from './features';
import { Queue } from './queue/queue';
import { ImportsOrchestratorQueueItem } from './import.service';
import { withQueue } from './features/queue';
import { withOrchestration } from './features/orchestration';
import { IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE } from './token';

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
  return [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE,
      useValue: imports,
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
