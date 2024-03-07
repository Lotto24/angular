import { InjectionToken } from '@angular/core';
import { Queue } from './queue/queue';
import { DeferQueueOrchestration } from './features/internal';
import { DeferQueueItem } from './service';

export const DEFER_QUEUE_FEATURE_CONCURRENCY = new InjectionToken<
  number | (() => number)
>('DEFER_QUEUE_FEAUTURE_CONCURRENCY');

export const DEFER_QUEUE_FEATURE_QUEUE = new InjectionToken<Queue<DeferQueueItem>>(
  'DEFER_QUEUE_FEATURE_QUEUE'
);

export const DEFER_QUEUE_FEATURE_TIMEOUT = new InjectionToken<number>(
  'DEFER_QUEUE_FEAUTURE_TIMEOUT'
);
export const DEFER_QUEUE_FEATURE_LOGGER = new InjectionToken<
  Pick<Console, 'info' | 'warn' | 'error' | 'debug'>
>('DEFER_QUEUE_FEAUTURE_LOGGER');

export const DEFER_QUEUE_FEATURE_ORCHESTRATION =
  new InjectionToken<DeferQueueOrchestration>(
    'DEFER_QUEUE_FEATURE_ORCHESTRATION'
  );
