import type { Router } from '@angular/router';
import { ActivationEnd } from '@angular/router';
import { filter, firstValueFrom, map } from 'rxjs';
import { ImportsOrchestratorConfig } from '../config/import.config';

/**
 * recursive loading of queued features
 */
export async function processQueueItem(
  config: ImportsOrchestratorConfig,
  router: Router
): Promise<void> {
  const { queue, logger } = config;
  // suspend processing while routing, as navigation takes precedence
  await routingFinished(config, router);

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

/**
 * Returns once routing has finished.
 * Returns immediately if routing is not ongoing.
 */
async function routingFinished(
  config: ImportsOrchestratorConfig,
  router: Router
): Promise<void> {
  const { logger } = config;

  if (!router.getCurrentNavigation()) {
    // return immediately, if routing is not ongoing
    return;
  }
  logger.debug('suspend while routing');

  const routingFinished$ = router.events.pipe(
    filter((event) => event instanceof ActivationEnd),
    map(() => undefined)
  );

  await firstValueFrom(routingFinished$);
  logger.debug('resume after routing');
  return;
}
