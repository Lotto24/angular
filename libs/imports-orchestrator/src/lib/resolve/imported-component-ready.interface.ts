/**
 * When implementing this interface, the queue will be interrupted until the promise returned by importedComponentReady resolves.
 */
export interface ImportedComponentReady {
  importedComponentReady(): Promise<void>;
}
