import type { ImportsOrchestratorQueueItem } from '../host-directive/import-queue.directive';
import { Queue } from './queue';

import { Logger } from '../config/import.config';

export class ImportsOrchestratorQueue extends Queue<ImportsOrchestratorQueueItem> {
  constructor(private logger: Logger) {
    super();
  }

  public override insert(priority: number, item: ImportsOrchestratorQueueItem) {
    super.insert(priority, item);
    // logger.debug(`insert @priority=${priority}, item=${item.import}`, this.data);
  }

  public override take(): ImportsOrchestratorQueueItem | undefined {
    const item = super.take();
    if (!item) {
      return undefined;
    }

    this.logger.debug(`take @priority=${item.priority}, item=${item.import}`);

    return item;
  }
}
