export function findResolveFn(
  config: { [index: string]: string | Function },
  importId: string,
  trail: string[] = []
): Function {
  const resolveFnOrString = config[importId];

  if (trail.includes(importId)) {
    throw new Error(
      `circular imports found: ${[...trail, importId].join(' => ')}`
    );
  }

  if (typeof resolveFnOrString === 'string') {
    return findResolveFn(config, resolveFnOrString, [...trail, importId]);
  }

  if (typeof resolveFnOrString === 'function') {
    return resolveFnOrString
  }

  throw new Error(`Missing resolve configuration for import: ${importId}`);
}
