import { Injectable } from '@angular/core';

import type { ImportQueueItem } from './import-queue.directive';
import { Queue } from './queue';
import { logger } from './util/logger';

@Injectable({ providedIn: 'root' })
export class ImportQueueProvider extends Queue<ImportQueueItem> {
  public override insert(priority: number, item: ImportQueueItem) {
    super.insert(priority, item);
    // logger.debug(`insert @priority=${priority}, item=${item.import}`, this.data);
  }

  public override take(): ImportQueueItem | undefined {
    const item = super.take();
    if (!item) {
      return undefined;
    }

    logger.debug(`take @priority=${item.priority}, item=${item.import}`);

    return item;
  }
}
