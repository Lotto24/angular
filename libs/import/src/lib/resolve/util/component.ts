import {ComponentRef, Injector, isStandalone, Type, ViewContainerRef} from "@angular/core";

export async function mountComponent(viewContainerRef: ViewContainerRef, injector: Injector, componentType: Type<unknown>): Promise<ComponentRef<unknown>> {
  return viewContainerRef.createComponent(componentType, {injector});
}

export function assertStandalone(resolved: Type<unknown>) {
  if (!isStandalone(resolved)) {
    throw new Error('provided resolver did not yield Angular standalone component');
  }
}
