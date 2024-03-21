import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  withConcurrencyStatic,
  withLogger, withoutRouting,
  withQueue,
  withTimeout,
} from './features';
import { Queue } from './queue/queue';
import {
  DeferQueueFeatureConcurrency,
  DeferQueueFeatureLogger,
  DeferQueueFeatureQueue, DeferQueueFeatureRouting,
  DeferQueueFeatureTimeout,
} from './features/internal';
import { DeferQueueItem } from './service';

export type DeferQueueFeatures = (
  | DeferQueueFeatureConcurrency
  | DeferQueueFeatureLogger
  | DeferQueueFeatureQueue
  | DeferQueueFeatureRouting
  | DeferQueueFeatureTimeout
)[];

export const provideDeferQueue = <O>(
  ...features: DeferQueueFeatures
): EnvironmentProviders =>
  makeEnvironmentProviders([
    ...[
      withConcurrencyStatic(1),
      withLogger(console),
      withQueue(new Queue<DeferQueueItem>()),
      withoutRouting(),
      withTimeout(),
    ].map((feature) => feature.providers),
    ...(features ?? []).map((feature) => feature.providers),
  ]);
