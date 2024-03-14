import { Injectable, signal } from '@angular/core';
import { SignalState } from 'defer-queue';

@Injectable({ providedIn: 'root' })
export class Service1 extends SignalState<number> {
  public readonly state = signal<number>(this.initialValue);
  constructor() {
    super();
    console.log('Service1, initial value=', this.state());
    setInterval(() => {
      const v = this.state() + 1;
      console.log('Service1, value=', v);
      this.state.set(v);
    }, 1000);
  }
}
