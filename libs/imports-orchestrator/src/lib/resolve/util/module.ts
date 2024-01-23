import { Type } from '@angular/core';

export interface ESModule {
  __esModule: boolean;
}

export interface NgModuleDef<T> {
  bootstrap: Type<any>[] | (() => Type<any>[]);
}

export const NG_MOD_DEF = getClosureSafeProperty({
  ɵmod: getClosureSafeProperty,
});
export const ES_MODULE = getClosureSafeProperty({
  __esModule: getClosureSafeProperty,
});

export function isESModule(type: any): type is ESModule {
  return type[Symbol.toStringTag] === 'Module' || type[ES_MODULE];
}

export function isNgModuleDef<T>(
  type: any
): type is Type<T> & { ɵmod: NgModuleDef<T> } {
  return !!type[NG_MOD_DEF];
}

function getClosureSafeProperty<T>(objWithPropertyToExtract: T): string {
  for (const key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === (getClosureSafeProperty as any)) {
      return key;
    }
  }
  throw Error('Could not find renamed property on target object.');
}
