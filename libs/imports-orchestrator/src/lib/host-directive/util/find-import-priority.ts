export function findImportPriority(
  priorities: { [key: string]: number },
  importId: string
): number {
  if (typeof priorities[importId] === 'number') {
    return priorities[importId];
  }

  const key = Object.keys(priorities).find((key) => importId.startsWith(key));

  if (key) {
    return priorities[key];
  }

  return 9999999999;
}
