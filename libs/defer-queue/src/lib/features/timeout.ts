import { Provider } from '@angular/core';
import {
  deferQueueFeature,
  DeferQueueFeatureKind,
  DeferQueueFeatureTimeout,
} from './internal';
import {DEFER_QUEUE_FEATURE_TIMEOUT} from "../token";

export function withTimeout(timeout: number = 10000): DeferQueueFeatureTimeout {
  const providers: Provider[] = [
    {
      provide: DEFER_QUEUE_FEATURE_TIMEOUT,
      useValue: timeout,
    },
  ];
  return deferQueueFeature(DeferQueueFeatureKind.Timeout, providers);
}
