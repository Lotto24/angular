import type {Router} from '@angular/router';
import {ResolveEnd} from '@angular/router';
import {filter, firstValueFrom, map} from 'rxjs';

import type {ImportQueueProvider} from './import-queue.provider';
import {logger} from "./util/logger";

/**
 * recursive loading of queued features
 */
export async function processImportQueue(queue: ImportQueueProvider, router: Router): Promise<void> {
  // suspend processing while routing, as navigation takes precedence
  await routingFinished(router);

  // let's take the next item off the queue
  const item = queue.take();

  // let's stop if there are no items in the queue
  if (!item) {
    logger.debug('queue is drained');
    return;
  }

  try {
    await item.resolveFn(item)
    // logger.debug(`changeDetection following import=${item.import}, componentRef${componentRef.instance}`);

    // let's loop recursively until the queue is processed
  } catch (x) {
    logger.error(`error processing item w/ import="${item.import}"`, x);
  }

  return await processImportQueue(queue, router);
}

/**
 * Returns once routing has finished.
 * Returns immediately if routing is not ongoing.
 * @param router
 */
async function routingFinished(router: Router): Promise<void> {
  if (!router.getCurrentNavigation()) {
    // return immediately, if routing is not ongoing
    return;
  }
  logger.debug('suspend while routing');

  const routingFinished$ = router.events.pipe(
    filter(event => event instanceof ResolveEnd),
    map(() => undefined)
  );

  await firstValueFrom(routingFinished$);
  logger.debug('resume after routing');
  return;
}
