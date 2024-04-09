import {
  deferQueueFeature,
  DeferQueueFeatureBailout,
  DeferQueueFeatureKind,
} from './internal';
import { Provider } from '@angular/core';
import { DEFER_QUEUE_FEATURE_BAILOUT } from '../token';

/**
 * Using this feature will initialize the signal for deferrable view conditions with true by default
 * effectively bypassing the condition.
 * @param value
 */
export function withBailout(value: boolean = true): DeferQueueFeatureBailout {
  const providers: Provider[] = [
    {
      provide: DEFER_QUEUE_FEATURE_BAILOUT,
      useValue: value,
    },
  ];
  return deferQueueFeature(DeferQueueFeatureKind.Bailout, providers);
}
