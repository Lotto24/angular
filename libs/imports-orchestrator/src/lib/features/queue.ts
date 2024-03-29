import {
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrhestratorQueue,
} from './internal';
import { Provider } from '@angular/core';
import { Queue } from '../queue/queue';
import { ImportsOrchestratorQueueItem } from '../service';
import { IMPORTS_ORCHESTRATOR_FEATURE_QUEUE } from '../internal';

export function withQueue(
  queue: Queue<ImportsOrchestratorQueueItem>
): ImportsOrhestratorQueue {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_QUEUE,
      useValue: queue,
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Queue,
    providers
  );
}
