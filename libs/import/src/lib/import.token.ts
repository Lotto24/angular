import {InjectionToken} from "@angular/core";
import {ImportQueueItemResolveFn} from "./import-queue.directive";

export type Orchestration = {
  [index: string]: number;
}

export type Imports = {
  [index: string]: ImportQueueItemResolveFn
}

export const ORCHESTRATION = new InjectionToken<Imports>('ANGULAR_IMPORT_ORCHESTRATOR_ORCHESTRATION');
export const IMPORTS: InjectionToken<any> = new InjectionToken<Orchestration>('ANGULAR_IMPORT_ORCHESTRATOR_IMPORTS');
