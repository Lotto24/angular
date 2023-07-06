import { InjectionToken } from '@angular/core';
import { Queue } from './queue/queue';
import { ImportsOrchestratorQueueItem } from './import.service';
import { ImportsOrchestration, ImportsStore } from './features/internal';

export const IMPORTS_ORCHESTRATOR_FEATURE_CONCURRENCY = new InjectionToken<
  number | (() => number)
>('IMPORTS_ORCHESTRATOR_FEAUTURE_CONCURRENCY');
export const IMPORTS_ORCHESTRATOR_FEATURE_DEFER_UNTIL_FIRST_NAVIGATION =
  new InjectionToken<boolean>(
    'IMPORTS_ORCHESTRATOR_FEAUTURE_DEFER_UNTIL_FIRST_NAVIGATION'
  );
export const IMPORTS_ORCHESTRATOR_FEATURE_TIMEOUT = new InjectionToken<number>(
  'IMPORTS_ORCHESTRATOR_FEAUTURE_TIMEOUT'
);
export const IMPORTS_ORCHESTRATOR_FEATURE_LOGGER = new InjectionToken<Console>(
  'IMPORTS_ORCHESTRATOR_FEAUTURE_LOGGER'
);
export const IMPORTS_ORCHESTRATOR_FEATURE_QUEUE = new InjectionToken<
  Queue<ImportsOrchestratorQueueItem>
>('IMPORTS_ORCHESTRATOR_FEATURE_QUEUE');
export const IMPORTS_ORCHESTRATOR_FEATURE_ORCHESTRATION =
  new InjectionToken<ImportsOrchestration>(
    'IMPORTS_ORCHESTRATOR_FEATURE_ORCHESTRATION'
  );
export const IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE =
  new InjectionToken<ImportsStore>(
    'IMPORTS_ORCHESTRATOR_FEATURE_IMPORTS_STORE'
  );
