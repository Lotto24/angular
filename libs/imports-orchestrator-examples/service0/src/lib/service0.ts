import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Service0 {
  constructor() {
    console.info('Service0 constructor');
  }

  public foo(): string {
    return 'bar';
  }
}
