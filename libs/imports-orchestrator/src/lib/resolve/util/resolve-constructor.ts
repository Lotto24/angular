import { Type } from '@angular/core';
import { ESModule, isESModule } from './module';

export type Constructor = Type<unknown>;

export function isAssumedESModuleContainingAngularComponentsOrModules(type: any) {
  return typeof type === 'object' && Object.keys(type).some(key => key.includes('Module') || key.includes('Component'));
}

export function resolveConstructorsFromESModule(
  esm: ESModule | Constructor
): Constructor[] {
  if (isESModule(esm) || isAssumedESModuleContainingAngularComponentsOrModules(esm)) {
    const constructors = Object.values<Constructor>(
      esm as unknown as { [index: string]: Constructor }
    ).filter((v) => typeof v === 'function');

    if (!constructors) {
      throw new Error('Class not found');
    }

    return constructors;
  }

  return [esm];
}

