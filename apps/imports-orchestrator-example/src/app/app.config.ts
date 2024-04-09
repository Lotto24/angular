import {
  NoPreloading,
  provideRouter,
  withHashLocation,
  withPreloading,
} from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideDeferQueue, withBailout,
  withConcurrencyUpdateFn,
  withSuspendWhileRouting,
  withTimeout,
} from 'defer-queue';
import {
  provideImportsOrchestration,
  withConcurrencyRelativeToDownlinkSpeed,
  withInterceptor, withLogger,
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


export class NullLogger  {
  public log(_message: any) {
    // noop
  }

  public info(_message: any) {
    // noop
  }

  public error(_message: any, _trace?: string) {
    // noop
  }

  public warn(_message: any) {
    // noop
  }

  public debug(_message: string) {
    // noop
  }

  public verbose(_message: string) {
    // noop
  }
}

export type AppImportsOrchestration = typeof APP_IMPORTS_ORCHESTRATION;
export const appConfig = {
  providers: [
    provideRouter(
      appRoutes,
      // withEnabledBlockingInitialNavigation(),
      withHashLocation(),
      withPreloading(NoPreloading)
    ),
    provideDeferQueue(
      withBailout(),
      withConcurrencyUpdateFn(downlinkToConcurrencyFn(8, 2)),
      withSuspendWhileRouting(),
      withTimeout(2000),
    ),
    provideImportsOrchestration(
      APP_IMPORTS_ORCHESTRATION,
      withInterceptor((identifier, hooks) => {
        console.log('interceptor, identifier', identifier);
        hooks.start.subscribe(() =>
          console.log('interceptor, started', identifier)
        );
        hooks.finish.subscribe(() =>
          console.log('interceptor, finished', identifier)
        );
        hooks.error.subscribe(() =>
          console.log('interceptor, error', identifier)
        );
      }),
      withLogger(new NullLogger()),
      // withSuspendWhileRoutingForImportsOrchestrator(),
      withConcurrencyRelativeToDownlinkSpeed(2, 1)
    ),
  ],
};

export function downlinkToConcurrencyFn(max: number, min: number = 1): () => number {
  return () => {
    const downlink = (navigator as any).connection?.downlink;

    if (!downlink) {
      // if devices do not provide a downlink speed, assign min concurrency for mobile devices and max concurrency for larger devices
      return screen.width < 768 ? min : max;
    }

    if (downlink < 5) {
      // 4G, 3G
      return min;
    } else if (downlink < 10) {
      // DSL
      return Math.max(min, Math.floor(min + (max - min) / 4));
    } else if (downlink < 30) {
      // slow WIFI
      return Math.max(min, Math.floor(min + (max - min) / 2));
    }

    return max;
  };
}
