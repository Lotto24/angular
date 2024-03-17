import { Provider } from '@angular/core';
import {
  deferQueueFeature,
  DeferQueueFeatureKind,
  DeferQueueFeatureQueue,
} from './internal';
import { Queue } from '../queue/queue';
import { DEFER_QUEUE_FEATURE_QUEUE } from '../token';
import { DeferQueueItem } from '../service';

export function withQueue<T extends DeferQueueItem>(
  queue: Queue<T>
): DeferQueueFeatureQueue {
  const providers: Provider[] = [
    {
      provide: DEFER_QUEUE_FEATURE_QUEUE,
      useValue: queue,
    },
  ];

  return deferQueueFeature(DeferQueueFeatureKind.Queue, providers);
}
