export const IMPORT_PRIORITY_LOWEST = 9999999999;
export function findImportPriority(
  priorities: { [p: string]: number },
  importId: string,
  logger: Console
): number {
  if (typeof priorities[importId] === 'number') {
    return priorities[importId];
  }

  const key = Object.keys(priorities).find((key) => importId.startsWith(key));

  if (key) {
    return priorities[key];
  }

  logger.warn(
    `no priority found for import '${importId}; falling back to lowest priority'`
  );

  return IMPORT_PRIORITY_LOWEST;
}
