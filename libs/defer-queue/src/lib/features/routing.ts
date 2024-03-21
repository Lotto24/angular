import { Provider } from '@angular/core';
import {
  deferQueueFeature,
  DeferQueueFeatureKind,
  DeferQueueFeatureRouting,
} from './internal';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import {
  asyncScheduler,
  filter,
  map,
  Observable,
  observeOn,
  of,
  shareReplay,
  startWith,
} from 'rxjs';
import { DEFER_QUEUE_FEATURE_ROUTING } from '../token';

export function withSuspendWhileRouting(
  suspendForInitialNavigation = true
): DeferQueueFeatureRouting {
  const providers: Provider[] = [
    {
      provide: DEFER_QUEUE_FEATURE_ROUTING,
      useFactory: (router: Router) =>
        isRoutingActive$(router, suspendForInitialNavigation),
      deps: [Router],
    },
  ];
  return deferQueueFeature(DeferQueueFeatureKind.Routing, providers);
}

export function withoutRouting(): DeferQueueFeatureRouting {
  const providers: Provider[] = [
    {
      provide: DEFER_QUEUE_FEATURE_ROUTING,
      useValue: of(false).pipe(shareReplay(1)),
    },
  ];
  return deferQueueFeature(DeferQueueFeatureKind.Routing, providers);
}

function isRoutingActive$(
  router: Router,
  suspendForInitialNavigation: boolean
): Observable<boolean> {
  const navigationActive$ = router.events.pipe(
    filter(
      (event) =>
        event instanceof NavigationStart || event instanceof NavigationEnd
    ),
    map((event) => {
      if (event instanceof NavigationStart) {
        return true;
      }

      return false;
    }),
    observeOn(asyncScheduler),
    startWith(suspendForInitialNavigation)
  );

  return navigationActive$.pipe(shareReplay(1));
}
