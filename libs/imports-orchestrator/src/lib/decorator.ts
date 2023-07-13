import { ImportsOrchestration } from './features/internal';
import { IMPORTS_STORE } from './internal';
import { ImportResolveFn } from './resolve';

export const Imports = <T extends ImportsOrchestration>(
  imports: Partial<{
    [key in keyof T]: keyof T | ImportResolveFn;
  }>
) => {
  Object.entries(imports).forEach(([key, value]) => {
    IMPORTS_STORE[key] = value as ImportResolveFn | string;
  });

  return function (target: unknown) {};
};
