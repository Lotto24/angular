import {
  ImportsOrchestration,
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrchestratorOrchestration,
} from './internal';
import { Provider } from '@angular/core';
import {IMPORTS_ORCHESTRATOR_FEATURE_ORCHESTRATION, IMPORTS_ORCHESTRATOR_FEATURE_LOGGER} from "../internal";
import {ConsoleLike} from "./logger";

export function withOrchestration(
  orchestration: ImportsOrchestration
): ImportsOrchestratorOrchestration {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_ORCHESTRATION,
      useFactory: (logger: ConsoleLike) =>
        validateOrchestration(orchestration, logger),
      deps: [IMPORTS_ORCHESTRATOR_FEATURE_LOGGER],
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Orchestration,
    providers
  );
}

function validateOrchestration(
  orchestration: ImportsOrchestration,
  logger: ConsoleLike
) {
  const conflicts = findConflictingPriorities(orchestration).map(
    ([priority, imports]) =>
      `conflicting priority=${priority} for @imports="${imports.join('", "')}"`
  );

  if (conflicts.length > 0) {
    logger.warn(conflicts.join('\n'));
  }

  return orchestration;
}

function findConflictingPriorities(orchestration: ImportsOrchestration) {
  const byPriority = Object.entries(orchestration).reduce<{
    [key: number]: string[];
  }>((acc, [key, value]) => {
    acc[value] = [...(acc[value] || []), key];
    return acc;
  }, {});

  return Object.entries(byPriority).filter(
    ([order, imports]) => imports.length > 1
  );
}
