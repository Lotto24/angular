import {
  NoPreloading,
  provideRouter,
  withHashLocation,
  withPreloading,
} from '@angular/router';
import { appRoutes } from './app.routes';
import {
  importPromise,
  importStandalone,
  provideImports,
  provideImportsOrchestration,
  withConcurrencyRelativeToDownlinkSpeed,
  withSuspendWhileRouting,
} from '@lotto24-angular/imports-orchestrator';

const APP_IMPORTS_ORCHESTRATION = {
  home0: 1,
  home1: 2,
  afterViewInit0: 2,
  afterViewInit1: 6,
  afterViewInit2: 7,
  afterViewInit3: 5,
  home2: 3,
  home3: 4,

  fruit0: 19,
  fruit1: 12,
  fruit2: 18,
  fruit3: 16,
  fruit4: 15,
  fruit5: 11,
  fruit6: 10,
  fruit7: 13,

  footer0: 1001,
  footer1: 1002,
  footer2: 1003,

  tab0: 31,
  tab1: 32,
  tab2: 33,
  tabKeep: 34,

  input: 501,

  servicePromise: 600,
  serviceComponent: 601,
};

export type AppImportsOrchestration = typeof APP_IMPORTS_ORCHESTRATION;

export const appConfig = {
  providers: [
    provideRouter(
      appRoutes,
      // withEnabledBlockingInitialNavigation(),
      withHashLocation(),
      withPreloading(NoPreloading)
    ),
    provideImportsOrchestration(
      APP_IMPORTS_ORCHESTRATION,
      withSuspendWhileRouting(),
      withConcurrencyRelativeToDownlinkSpeed(2, 1)
    ),
    provideImports<AppImportsOrchestration>({
      servicePromise: importPromise(() =>
        fetch('/assets/example.json').then((res) => res.json())
      ),
      serviceComponent: importStandalone(
        () => import('@lotto24-angular/imports-orchestrator-examples/fruit2')
      ),
    }),
  ],
};
