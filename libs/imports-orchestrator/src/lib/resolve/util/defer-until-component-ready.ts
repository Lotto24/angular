import { ImportedComponentReady } from '../imported-component-ready.interface';

export function deferUntilComponentReady<T>(
  importedComponentReady: () => Promise<void>,
  timeoutMs: number
): Promise<void> {
  const timeout = new Promise<void>((_, reject) =>
    setTimeout(
      () => reject(`component ready timeout=${timeoutMs}ms`),
      timeoutMs
    )
  );
  return Promise.race([importedComponentReady(), timeout]);
}

export function assertImportedComponentReadyEmitter(
  type: any
): type is ImportedComponentReady {
  return (type as ImportedComponentReady).importedComponentReady !== undefined;
}
