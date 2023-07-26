import { ComponentRef } from '@angular/core';

/**
 * Type-safely assign values to your ComponentRef<T>'s @Input decorated properties.
 */
export function setComponentRefInput<T, U extends keyof T & string>(
  ref: ComponentRef<T>,
  key: U,
  value: T[U]
) {
  ref.setInput(key, value);
}
