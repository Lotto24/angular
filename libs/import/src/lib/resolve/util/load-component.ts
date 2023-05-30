import type { Component, ComponentRef, Injector, NgModuleRef, Type, ViewContainerRef } from '@angular/core';
import {createNgModule, createNgModuleRef} from '@angular/core';

import { LOG_PREFIX } from '../../util/logger';
import { retry } from './retry';

export type ImportEsModuleResolveFn = () => Promise<Type<unknown>>;

// const logger = new Logger('ImportDirective:loadComponent');

export async function loadComponent(
  importId: string,
  resolveFn: ImportEsModuleResolveFn,
  content: ViewContainerRef,
  injector: Injector
): Promise<ComponentRef<unknown>> {
  const module = await resolveNgModuleRef(resolveFn, injector);
  const bootstrapComponent = extractBootstrapComponent(module, importId);
  return content.createComponent(bootstrapComponent, { ngModuleRef: module, injector: module.injector });
}

function extractBootstrapComponent(module: NgModuleRef<unknown>, importId: string): Type<Component> {
  const bootstrapComponents = (module as any)._bootstrapComponents as Array<Type<any>>;
  if (!!bootstrapComponents && bootstrapComponents.length > 0) {
    return bootstrapComponents[0];
  } else {
    throw new Error(
      `${LOG_PREFIX}: NgModule (${importId}) does not have a bootstrapComponent defined. A bootstrapComponent is required for lazy loading.`
    );
  }
}

async function resolveNgModuleRef(
  resolveFn: ImportEsModuleResolveFn,
  injector: Injector
): Promise<NgModuleRef<unknown>> {
  const component = await retry(async () => {
    // If offline, dont attempt to lazy load chunk.
    // Once import promise fails, there is no way to recover
    if (!window.navigator.onLine) {
      throw new Error(`${LOG_PREFIX}: offline, cannot load chunk`);
    }

    return await resolveFn();
  });

  return createNgModule(component, injector);
}
