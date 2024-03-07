import {Queue} from './queue';
import {ConsoleLike, QueueItem} from "../token";

/**
 * recursive loading of queued features
 */
export async function processQueueItem(
  queue: Queue<QueueItem>,
  logger: ConsoleLike,
): Promise<void> {
  // let's take the next item off the queue
  const item = queue.take();

  // let's stop if there are no items in the queue
  if (!item) {
    logger.debug('queue is drained');
    return;
  }

  logger.debug(`queue item resolve (${item})`);

  try {
    // const result = await item.resolveFn(item);
    logger.debug(`queue item resolved (${item})`);
  } catch (x) {
    logger.error(`error resolving queue item (${item})`, x);
  }
}
