import type {ImportQueueItem} from '../host-directive/import-queue.directive';
import {Queue} from './queue';

import {Logger} from "../provider/import-config.provider";

export class ImportQueue extends Queue<ImportQueueItem> {
  constructor(private logger: Logger) {
    super();
  }

  public override insert(priority: number, item: ImportQueueItem) {
    super.insert(priority, item);
    // logger.debug(`insert @priority=${priority}, item=${item.import}`, this.data);
  }

  public override take(): ImportQueueItem | undefined {
    const item = super.take();
    if (!item) {
      return undefined;
    }

    this.logger.debug(`take @priority=${item.priority}, item=${item.import}`);

    return item;
  }
}
