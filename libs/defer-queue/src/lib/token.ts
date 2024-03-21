import { InjectionToken } from '@angular/core';
import { Queue } from './queue/queue';
import { DeferQueueItem } from './service';
import {Observable} from "rxjs";

export const DEFER_QUEUE_FEATURE_CONCURRENCY = new InjectionToken<
  number | (() => number)
>('DEFER_QUEUE_FEAUTURE_CONCURRENCY');

export const DEFER_QUEUE_FEATURE_QUEUE = new InjectionToken<Queue<DeferQueueItem>>(
  'DEFER_QUEUE_FEATURE_QUEUE'
);

export const DEFER_QUEUE_FEATURE_ROUTING = new InjectionToken<Observable<boolean>>(
  'DEFER_QUEUE_FEATURE_ROUTING'
);

export const DEFER_QUEUE_FEATURE_TIMEOUT = new InjectionToken<number>(
  'DEFER_QUEUE_FEAUTURE_TIMEOUT'
);
export const DEFER_QUEUE_FEATURE_LOGGER = new InjectionToken<
  Pick<Console, 'info' | 'warn' | 'error' | 'debug'>
>('DEFER_QUEUE_FEAUTURE_LOGGER');
