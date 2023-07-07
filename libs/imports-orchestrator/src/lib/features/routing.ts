import { Provider } from '@angular/core';
import {
  importsOrchestratorFeature,
  ImportsOrchestratorFeatureKind,
  ImportsOrchestratorRouting,
} from './internal';
import { IMPORTS_ORCHESTRATOR_FEATURE_ROUTING } from '../token';
import { ActivationEnd, ActivationStart, Router } from '@angular/router';
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
  const active$ = router.events.pipe(
    filter(
      (event) =>
        event instanceof ActivationStart || event instanceof ActivationEnd
    ),
    map((event) => {
      if (event instanceof ActivationStart) {
        return true;
      }

      return false;
    }),
    startWith(suspendForInitialNavigation)
  );

  return active$.pipe(shareReplay(1));
}
