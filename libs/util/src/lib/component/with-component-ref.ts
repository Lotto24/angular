import { ComponentRef } from '@angular/core';

/**
 * Type-safely assign values to your ComponentRef<T>'s @Input decorated properties.
 * You can also chain input assignments
 *
 * @example
 * setComponentRefInput(componenRef).setInput(key, value).setInput(key, value)...
 */
export function withComponentRef<T>(ref: ComponentRef<T>) {
  const setInput = <K extends keyof T & string>(key: K, value: T[K]) => {
    ref.setInput(key, value);
    return { setInput };
  };

  return { setInput };
}
