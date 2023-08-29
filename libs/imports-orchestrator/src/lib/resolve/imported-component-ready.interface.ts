import { Signal } from '@angular/core';
import {Observable} from "rxjs";

/**
 * When implementing this interface, the queue will be interrupted until the promise returned by importedComponentReady resolves.
 */
export interface ImportedComponentReady {
  importedComponentReady(): Promise<void> | Observable<boolean> | Signal<boolean>;
}
