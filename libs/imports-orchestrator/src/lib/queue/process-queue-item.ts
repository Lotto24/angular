import { filter, firstValueFrom, Observable, tap } from 'rxjs';
import { ImportsOrchestratorQueueItem } from '../import.service';
import { Queue } from './queue';

/**
 * recursive loading of queued features
 */
export async function processQueueItem(
  queue: Queue<ImportsOrchestratorQueueItem>,
  logger: Console,
  isRountingActive$: Observable<boolean>
): Promise<void> {
  // suspend processing while routing, as navigation takes precedence
  await firstValueFrom(
    isRountingActive$.pipe(
      tap((active) => logger.debug(`routing active: ${active}`)),
      filter((active) => !active)
    )
  );

  // let's take the next item off the queue
  const item = queue.take();

  // let's stop if there are no items in the queue
  if (!item) {
    logger.debug('queue is drained');
    return;
  }

  logger.debug(
    `queue item try resolve (@priority=${item?.priority}, @identifier=${item?.identifier})`
  );

  try {
    item.lifecycle?.importStarted?.emit();
    const result = await item.resolveFn(item);
    item.lifecycle?.importFinished?.emit(result);
    item.callback && item.callback(result, null);

    logger.debug(
      `queue item resolved (@priority=${item?.priority}, @identifier=${item?.identifier})`
    );
  } catch (x) {
    item.lifecycle?.importErrored?.emit(x);
    item.callback && item.callback(null, x);
    logger.error(
      `error resolving queue item (@priority=${item?.priority}, @identifier=${item?.identifier})`,
      x
    );
  }
}
