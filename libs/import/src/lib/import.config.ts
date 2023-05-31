import {Injectable, Provider} from '@angular/core';
import {ImportQueueItemResolveFn} from "./import-queue.directive";
import {Imports, IMPORTS, Orchestration, ORCHESTRATION} from "./import.token";

@Injectable({ providedIn: 'root' })
class ImportConfigService {
  public orchestration: Orchestration = {};
  public imports: Imports = {};

  public updateOrchestration(value: Orchestration): Orchestration {
    this.orchestration = {...this.orchestration, ...value ?? {}};
    return this.orchestration;
  }

  public updateImports(value: Imports): Imports {
    this.imports = {...this.imports, ...value ?? {}};
    return this.imports;
  }
}

export function provideImports<T>(
  orchestration: T & Orchestration,
  imports: Partial<{ [key in keyof T]: ImportQueueItemResolveFn }>): Provider[] {
  return [
    {
      provide: ORCHESTRATION,
      useFactory: (config: ImportConfigService) => config.updateOrchestration(orchestration),
      deps: [ImportConfigService]
    },
    {
      provide: IMPORTS,
      useFactory: (config: ImportConfigService) => config.updateImports(imports as Imports),
      deps: [ImportConfigService]
    }
  ]
}
