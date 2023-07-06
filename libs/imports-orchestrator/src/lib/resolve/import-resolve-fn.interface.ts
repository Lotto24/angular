import { ImportsOrchestratorQueueItem } from '../import.service';

export type ImportResolveFn = (
  item: ImportsOrchestratorQueueItem
) => Promise<unknown>;
