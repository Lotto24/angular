export function findFn<T>(
  config: { [index: string]: string | T },
  key: string,
  trail: string[] = []
): T {
  const stringOrFn = config[key];

  if (trail.includes(key)) {
    throw new Error(
      `circular reference found: ${[...trail, key].join(' => ')}`
    );
  }

  if (typeof stringOrFn === 'string') {
    return findFn(config, stringOrFn, [...trail, key]);
  }

  if (typeof stringOrFn === 'function') {
    return stringOrFn;
  }

  throw new Error(`Missing entry for key="${key}"`);
}
