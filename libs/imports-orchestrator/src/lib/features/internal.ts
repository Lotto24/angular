import { Provider } from '@angular/core';
import { ImportResolveFn } from '../resolve';

export type Concurrency =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Concurrency>;

export type DeferUntilFirstNavigation =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.DeferUntilFirstNavigation>;

export type ImportsOrchestratorTimeout =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Timeout>;

export type ImportsOrchestratorLogger =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Logger>;

export type ImportsOrhestratorQueue =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Queue>;

export type ImportsOrchestratorOrchestration =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.Orchestration>;

export type ImportsOrchestratorImportsStore =
  ImportsOrchestratorFeature<ImportsOrchestratorFeatureKind.ImportsStore>;

export enum ImportsOrchestratorFeatureKind {
  Logger,
  Timeout,
  DeferUntilFirstNavigation,
  Concurrency,
  // internal
  ImportsStore,
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
const importsOrchestratorImportsStore: ImportsStore = {};
export const IMPORTS_ORCHESTRATOR_IMPORTS: () => ImportsStore = () =>
  importsOrchestratorImportsStore;
