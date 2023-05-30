import {InjectionToken} from '@angular/core';
import {ImportQueueItemResolveFn} from "./import-queue.directive";

export const IMPORT_PRIORITIES = new InjectionToken<{ [key: string]: number }>('IMPORT_RIORITIES');
export const IMPORT_COMPONENTS: InjectionToken<any> = new InjectionToken<{ [key: string]: ImportQueueItemResolveFn }>('IMPORT_COMPONENTS');
