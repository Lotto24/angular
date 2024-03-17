import { Provider } from '@angular/core';

export type DeferQueueFeatureConcurrency =
  DeferQueueFeature<DeferQueueFeatureKind.Concurrency>;
export type DeferQueueFeatureLogger =
  DeferQueueFeature<DeferQueueFeatureKind.Logger>;
export type DeferQueueFeatureQueue =
  DeferQueueFeature<DeferQueueFeatureKind.Queue>;
export type DeferQueueFeatureTimeout =
  DeferQueueFeature<DeferQueueFeatureKind.Timeout>;

export enum DeferQueueFeatureKind {
  Logger = 0,
  Queue = 1,
  Concurrency = 2,
  Timeout = 3,
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
