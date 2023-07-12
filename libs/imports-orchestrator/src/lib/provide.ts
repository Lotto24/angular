import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
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
import { ImportsOrchestratorQueueItem } from './service';
import { withQueue } from './features/queue';
import { withOrchestration } from './features/orchestration';

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

