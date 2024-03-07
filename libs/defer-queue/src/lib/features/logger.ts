import { Provider } from '@angular/core';
import {
  deferQueueFeature,
  DeferQueueFeatureKind,
  DeferQueueFeatureLogger,
} from './internal';
import { DEFER_QUEUE_FEATURE_LOGGER } from '../token';
import {ConsoleLike} from "../interface";

export function withLogger(logger: ConsoleLike): DeferQueueFeatureLogger {
  const providers: Provider[] = [
    {
      provide: DEFER_QUEUE_FEATURE_LOGGER,
      useValue: logger,
    },
  ];
  return deferQueueFeature(DeferQueueFeatureKind.Logger, providers);
}
