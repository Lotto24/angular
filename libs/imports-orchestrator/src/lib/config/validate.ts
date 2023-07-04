import { Logger, Orchestration } from './import.config';

export function validateOrchestration(
  orchestration: Orchestration,
  logger: Logger
) {
  const conflicts = findConflictingPriorities(orchestration).map(
    ([priority, imports]) =>
      `conflicting priority=${priority} for @imports="${imports.join('", "')}"`
  );

  if (conflicts.length > 0) {
    logger.warn(conflicts.join('\n'));
  }
}

function findConflictingPriorities(orchestration: Orchestration) {
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
