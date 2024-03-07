import { Provider } from '@angular/core';
import {
  deferQueueFeature,
  DeferQueueFeatureKind,
  DeferQueueFeatureLogger,
} from './internal';
import { ConsoleLike, DEFER_QUEUE_FEATURE_LOGGER } from '../token';

export function withLogger(logger: ConsoleLike): DeferQueueFeatureLogger {
  const providers: Provider[] = [
    {
      provide: DEFER_QUEUE_FEATURE_LOGGER,
      useValue: logger,
    },
  ];
  return deferQueueFeature(DeferQueueFeatureKind.Logger, providers);
}
