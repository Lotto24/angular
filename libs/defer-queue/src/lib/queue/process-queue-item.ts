import { Queue } from './queue';
import { ConsoleLike } from '../interface';
import { DeferQueueItem } from '../service';

/**
 * recursive loading of queued features
 */
export async function processQueueItem(
  queue: Queue<DeferQueueItem>,
  logger: ConsoleLike
): Promise<void> {
  // let's take the next item off the queue
  const item = queue.take();

  // let's stop if there are no items in the queue
  if (!item) {
    logger.debug('queue is drained');
    return;
  }

  try {
    await item.resolved();
  } catch (x) {
    logger.error(`error resolving queue item (${item})`, x);
  }
}
