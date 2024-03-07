import { Provider } from '@angular/core';
import {
  deferQueueFeature,
  DeferQueueFeatureKind,
  DeferQueueFeatureOrchestration,
  DeferQueueOrchestration,
} from './internal';
import {
  DEFER_QUEUE_FEATURE_LOGGER,
  DEFER_QUEUE_FEATURE_ORCHESTRATION,
} from '../token';
import {ConsoleLike} from "../interface";

export function withOrchestration(
  orchestration: DeferQueueOrchestration
): DeferQueueFeatureOrchestration {
  const providers: Provider[] = [
    {
      provide: DEFER_QUEUE_FEATURE_ORCHESTRATION,
      useFactory: (logger: ConsoleLike) =>
        validateOrchestration(orchestration, logger),
      deps: [DEFER_QUEUE_FEATURE_LOGGER],
    },
  ];
  return deferQueueFeature(DeferQueueFeatureKind.Orchestration, providers);
}

function validateOrchestration(
  orchestration: DeferQueueOrchestration,
  logger: ConsoleLike
) {
  const conflicts = findConflictingPriorities(orchestration).map(
    ([priority, queued]) =>
      `conflicting priority=${priority} for @queued="${queued.join('", "')}"`
  );

  if (conflicts.length > 0) {
    logger.warn(conflicts.join('\n'));
  }

  return orchestration;
}

function findConflictingPriorities(orchestration: DeferQueueOrchestration) {
  const byPriority = Object.entries(orchestration).reduce<{
    [key: number]: string[];
  }>((acc, [key, value]) => {
    acc[value] = [...(acc[value] || []), key];
    return acc;
  }, {});

  return Object.entries(byPriority).filter(
    ([_, imports]) => imports.length > 1
  );
}
