import { Injectable } from '@angular/core';
import {ObservableState} from "defer-queue";
import {interval, Observable, scan} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Service0 implements ObservableState<number> {
  constructor() {
    console.info('Service0 constructor');
  }

  public readonly value$ = interval(1000).pipe(scan((acc) => acc += 1, 0))

}
