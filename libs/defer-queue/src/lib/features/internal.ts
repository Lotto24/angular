import { Provider } from '@angular/core';

export type DeferQueueFeatureConcurrency =
  DeferQueueFeature<DeferQueueFeatureKind.Concurrency>;
export type DeferQueueFeatureLogger =
  DeferQueueFeature<DeferQueueFeatureKind.Logger>;
export type DeferQueueFeatureQueue =
  DeferQueueFeature<DeferQueueFeatureKind.Queue>;
export type DeferQueueFeatureRouting =
  DeferQueueFeature<DeferQueueFeatureKind.Routing>;
export type DeferQueueFeatureTimeout =
  DeferQueueFeature<DeferQueueFeatureKind.Timeout>;

export enum DeferQueueFeatureKind {
  Logger,
  Queue,
  Routing,
  Concurrency,
  Timeout,
}

export type DeferQueueFeature<T extends DeferQueueFeatureKind> = {
  kind: T;
  providers: Provider[];
};

export function deferQueueFeature<T extends DeferQueueFeatureKind>(
  kind: T,
  providers: Provider[]
): DeferQueueFeature<T> {
  return { kind, providers };
}
