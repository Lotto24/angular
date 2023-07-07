import { Provider } from '@angular/core';
import {
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrchestratorRouting,
} from './internal';
import { IMPORTS_ORCHESTRATOR_FEATURE_ROUTING } from '../token';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, map, Observable, of, shareReplay, startWith } from 'rxjs';

export function withSuspendWhileRouting(
  suspendForInitialNavigation = true
): ImportsOrchestratorRouting {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_ROUTING,
      useFactory: (router: Router) =>
        isRoutingActive$(router, suspendForInitialNavigation),
      deps: [Router],
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Routing,
    providers
  );
}

export function withoutRouting(): ImportsOrchestratorRouting {
  const providers: Provider[] = [
    {
      provide: IMPORTS_ORCHESTRATOR_FEATURE_ROUTING,
      useValue: of(false).pipe(shareReplay(1)),
    },
  ];
  return importsOrchestratorFeature(
    ImportsOrchestratorFeatureKind.Routing,
    providers
  );
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
    startWith(suspendForInitialNavigation)
  );

  return navigationActive$.pipe(shareReplay(1));
}
