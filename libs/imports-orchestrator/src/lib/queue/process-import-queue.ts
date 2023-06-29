import type { Router } from '@angular/router';
import { ActivationEnd } from '@angular/router';
import { filter, firstValueFrom, map } from 'rxjs';
import { ImportsOrchestratorConfig } from '../config/import.config';

/**
 * recursive loading of queued features
 */
export async function processImportQueue(
  pid: number,
  config: ImportsOrchestratorConfig,
  router: Router
): Promise<void> {
  const { queue, logger } = config;
  // suspend processing while routing, as navigation takes precedence
  await routingFinished(pid, config, router);

  // let's take the next item off the queue
  const item = queue.take();

  // let's stop if there are no items in the queue
  if (!item) {
    logger.debug('queue is drained', `(pid=${pid})`);
    return;
  }

  logger.debug(
    `queue item @priority=${item?.priority}, @import=${item?.import}`,
    `(pid=${pid})`
  );

  try {
    await item.resolveFn(item);
    // logger.debug(`changeDetection following import=${item.import}, componentRef${componentRef.instance}`);

    // let's loop recursively until the queue is processed
  } catch (x) {
    logger.error(
      `error processing item w/ import="${item.import}"`,
      `(pid=${pid})`,
      x
    );
  }
}

/**
 * Returns once routing has finished.
 * Returns immediately if routing is not ongoing.
 */
async function routingFinished(
  pid: number,
  config: ImportsOrchestratorConfig,
  router: Router
): Promise<void> {
  const { logger } = config;

  if (!router.getCurrentNavigation()) {
    // return immediately, if routing is not ongoing
    return;
  }
  logger.debug('suspend while routing', `(pid=${pid})`);

  const routingFinished$ = router.events.pipe(
    filter((event) => event instanceof ActivationEnd),
    map(() => undefined)
  );

  await firstValueFrom(routingFinished$);
  logger.debug('resume after routing', `(pid=${pid})`);
  return;
}
