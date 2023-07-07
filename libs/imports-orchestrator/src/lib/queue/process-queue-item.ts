import {ImportsOrchestratorQueueItem} from '../import.service';
import {Queue} from './queue';

/**
 * recursive loading of queued features
 */
export async function processQueueItem(
  queue: Queue<ImportsOrchestratorQueueItem>,
  logger: Console,
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
    item.lifecycle?.importStarted?.emit();
    const result = await item.resolveFn(item);
    item.lifecycle?.importFinished?.emit(result);
    item.callback && item.callback(result, null);

    logger.debug(`queue item resolved (${item})`);
  } catch (x) {
    item.lifecycle?.importErrored?.emit(x);
    item.callback && item.callback(null, x);
    logger.error(`error resolving queue item (${item})`, x);
  }
}
