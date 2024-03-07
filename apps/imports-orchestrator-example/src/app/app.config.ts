import {
  NoPreloading,
  provideRouter,
  withHashLocation,
  withPreloading,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { provideDeferQueue } from 'defer-queue';
import {
  provideImportsOrchestration,
  withConcurrencyRelativeToDownlinkSpeed,
  withSuspendWhileRouting,
} from '@lotto24-angular/imports-orchestrator';

const APP_IMPORTS_ORCHESTRATION = {
  home0: 162,
  home1: 161,
  observableInput: 3,
  deferredPromise: 2,
  deferredObservable: 6,
  deferredSignal: 22,
  alias0: 7,
  alias1: 5,
  home2: 27,
  home3: 28,

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

  servicePromiseQueued: 600,
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
    provideDeferQueue(APP_IMPORTS_ORCHESTRATION),
    provideImportsOrchestration(
      APP_IMPORTS_ORCHESTRATION,
      withSuspendWhileRouting(),
      withConcurrencyRelativeToDownlinkSpeed(2, 1)
    ),
  ],
};
