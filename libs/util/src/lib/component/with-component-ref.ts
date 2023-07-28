import { ComponentRef } from '@angular/core';

/**
 * Type-safely assign values to your ComponentRef's @Input decorated properties.
 */
export function setComponentRefInput<T, K extends keyof T & string>(
  ref: ComponentRef<T>,
  key: K,
  value: T[K]
): void {
  ref.setInput(key, value);
}
