import {isStandalone, Type} from "@angular/core";

export function assertStandalone(resolved: Type<unknown>) {
  if (!isStandalone(resolved)) {
    throw new Error(
      'provided resolver did not yield Angular standalone component'
    );
  }
}
