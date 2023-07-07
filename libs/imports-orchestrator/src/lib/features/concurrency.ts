import { Provider } from '@angular/core';
import {
  ImportsOrchestratorConcurrency,
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
} from './internal';
import { IMPORTS_ORCHESTRATOR_FEATURE_CONCURRENCY } from '../token';

export function withConcurrencyRelativeToDownlinkSpeed(
  max: number = 4,
  min: number = 1
): ImportsOrchestratorConcurrency {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_CONCURRENCY,
      useValue: downlinkToConcurrencyFn(max, min),
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Concurrency,
    providers
  );
}

export function withConcurrencyStatic(value: number): ImportsOrchestratorConcurrency {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_CONCURRENCY,
      useValue: value,
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Concurrency,
    providers
  );
}

function downlinkToConcurrencyFn(max: number, min: number = 1): () => number {
  return () => {
    const downlink = (navigator as any).connection?.downlink ?? 10;

    if (downlink < 1) {
      return min;
    } else if (downlink < 2) {
      return Math.max(min, Math.floor(min + (max - min) / 4));
    } else if (downlink < 4) {
      return Math.max(min, Math.floor(min + (max - min) / 2));
    } else if (downlink < 8) {
      return Math.max(min, Math.floor(min + (max - min) / 1.5));
    }

    return max;
  };
}
