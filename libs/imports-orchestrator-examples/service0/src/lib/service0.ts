import { Injectable } from '@angular/core';
import { ObservableState } from 'defer-queue';
import { Observable, interval, scan } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Service0 extends ObservableState<number> {
  public readonly state$: Observable<number> = interval(1000).pipe(
    scan((acc) => (acc += 1), this.initialValue)
  );
}
