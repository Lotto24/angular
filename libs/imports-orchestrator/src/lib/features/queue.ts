import {
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrhestratorQueue,
} from './internal';
import { Provider } from '@angular/core';
import { Queue } from '../queue/queue';
import { ImportsOrchestratorQueueItem } from '../import.service';
import {IMPORTS_ORCHESTRATOR_FEATURE_QUEUE} from "../token";

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
