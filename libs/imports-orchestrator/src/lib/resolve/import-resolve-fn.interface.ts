import { ImportsOrchestratorQueueItem } from '../service';

export type ImportResolveFn = (
  item: ImportsOrchestratorQueueItem
) => Promise<unknown>;
