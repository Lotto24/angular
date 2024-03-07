import { Provider } from '@angular/core';
import { DEFER_QUEUE_FEATURE_CONCURRENCY } from '../token';
import {
  deferQueueFeature,
  DeferQueueFeatureConcurrency,
  DeferQueueFeatureKind,
} from './internal';

export function withConcurrencyStatic(
  value: number
): DeferQueueFeatureConcurrency {
  const providers: Provider[] = [
    {
      provide: DEFER_QUEUE_FEATURE_CONCURRENCY,
      useValue: value,
    },
  ];
  return deferQueueFeature(DeferQueueFeatureKind.Concurrency, providers);
}
