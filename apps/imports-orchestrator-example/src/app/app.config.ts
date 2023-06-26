import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { provideImportsOrchestration } from '@lotto24-angular/imports-orchestrator';

const APP_IMPORTS_ORCHESTRATION = {
  home0: 1,
  home1: 2,
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
};

export type AppImportsOrchestration = typeof APP_IMPORTS_ORCHESTRATION;

export const appConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withEnabledBlockingInitialNavigation(),
      withHashLocation()
    ),
    provideImportsOrchestration(APP_IMPORTS_ORCHESTRATION, { parallel: 2 }),
  ],
};
