import { Injectable, signal } from '@angular/core';
import { SignalState } from 'defer-queue';

@Injectable({ providedIn: 'root' })
export class Service1 implements SignalState<number> {
  constructor() {
    console.info('Service1 constructor');
    let n = 500;
    setInterval(() => {
      const v = ++n;
      console.log('Service1, value=', v);
      this.value.set(v);
    }, 1000);
  }

  public value = signal(100);
}
