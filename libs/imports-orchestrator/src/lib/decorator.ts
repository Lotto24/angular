import { ImportsStore } from './features/internal';
import { IMPORTS_STORE } from './internal';
import { ImportResolveFn } from './resolve';

export const Imports = (imports: ImportsStore) => {
  const store = IMPORTS_STORE;
  Object.entries(imports).forEach(([key, value]) => {
    store[key] = value as ImportResolveFn;
  });

  return function (target: unknown) {};
};
