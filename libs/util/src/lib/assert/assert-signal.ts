import { isSignal } from '@angular/core';

export function assertSignal(type: any) {
  return isSignal(type);
}
