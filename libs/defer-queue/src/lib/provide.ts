import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  withConcurrencyStatic,
  withLogger,
  withOrchestration,
  withQueue,
} from './features';
import { Queue } from './queue/queue';
import { QueueItem } from './token';
import {
  DeferQueueFeatureConcurrency,
  DeferQueueFeatureLogger,
  DeferQueueFeatureOrchestration,
  DeferQueueFeatureQueue,
  DeferQueueFeatureTimeout,
} from './features/internal';
import { withTimeout } from './features/timeout';

export type DeferQueueFeatures = (
  | DeferQueueFeatureConcurrency
  | DeferQueueFeatureLogger
  | DeferQueueFeatureOrchestration
  | DeferQueueFeatureQueue
  | DeferQueueFeatureTimeout
)[];

export const provideDeferQueue = <O>(
  orchestration: O & {
    [index: string]: number;
  },
  ...features: DeferQueueFeatures
): EnvironmentProviders =>
  makeEnvironmentProviders([
    ...[
      withConcurrencyStatic(1),
      withLogger(console),
      withQueue(new Queue<QueueItem>()),
      withTimeout(),
    ].map((feature) => feature.providers),
    ...(features ?? []).map((feature) => feature.providers),
    ...withOrchestration(orchestration).providers,
  ]);
