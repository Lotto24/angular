import { Provider } from '@angular/core';
import { ImportResolveFn } from '../resolve';

export type ImportsOrchestratorConcurrency =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Concurrency>;

export type ImportsOrchestratorRouting =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Routing>;

export type ImportsOrchestratorTimeout =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Timeout>;

export type ImportsOrchestratorLogger =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Logger>;

export type ImportsOrhestratorQueue =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Queue>;

export type ImportsOrchestratorOrchestration =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Orchestration>;

export enum ImportsOrchestratorFeatureKind {
  Logger,
  Timeout,
  Routing,
  Concurrency,
  // internal
  Orchestration,
  Queue,
}

// internal utils

export type ImportsOrchestratorFeature<
  T extends ImportsOrchestratorFeatureKind
> = {
  kind: T;
  providers: Provider[];
};

export function importsOrchestratorFeature<
  T extends ImportsOrchestratorFeatureKind
>(kind: T, providers: Provider[]): ImportsOrchestratorFeature<T> {
  return { kind, providers };
}

export type ImportsOrchestration = {
  [index: string]: number;
};
export type ImportsStore = {
  [index: string]: string | ImportResolveFn;
};
