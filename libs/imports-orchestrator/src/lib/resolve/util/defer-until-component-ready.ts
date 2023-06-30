import { ImportedComponentReady } from '../imported-component-ready.interface';

export function deferUntilComponentReady<T>(
  instance: ImportedComponentReady,
  timeoutMs: number
): Promise<void> {
  const timeout = new Promise<void>((_, reject) =>
    setTimeout(
      () => reject(`component ready timeout=${timeoutMs}ms`),
      timeoutMs
    )
  );

  return Promise.race([
    instance.importedComponentReady.call(instance),
    timeout,
  ]);
}

export function assertImportedComponentReadyEmitter(
  type: any
): type is ImportedComponentReady {
  return (type as ImportedComponentReady).importedComponentReady !== undefined;
}
