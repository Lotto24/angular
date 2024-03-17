import {ConsoleLike} from "../interface";

export const PRIORITY_LOWEST = 9999999999;
export function findPriority(
  priorities: { [p: string]: number },
  identifier: string,
  logger: ConsoleLike
): number {
  if (typeof priorities[identifier] === 'number') {
    return priorities[identifier];
  }

  const key = Object.keys(priorities).find((key) => identifier.startsWith(key));

  if (key) {
    return priorities[key];
  }

  logger.warn(
    `no priority found for import '${identifier}; falling back to lowest priority'`
  );

  return PRIORITY_LOWEST;
}
