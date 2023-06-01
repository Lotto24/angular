import {Provider} from '@angular/core';
import {ImportQueueItemResolveFn} from "./host-directive/import-queue.directive";
import {
  AngularImportOrchestratorOptions,
  ImportConfigProvider,
  Imports,
  Orchestration
} from "./provider/import-config.provider";

export function provideImports<T>(
  orchestration: T & Orchestration,
  imports: Partial<{ [key in keyof T]: ImportQueueItemResolveFn }>,
  options?: Partial<AngularImportOrchestratorOptions>): Provider[] {

  return [{
    provide: ImportConfigProvider,
    useFactory: () => {
      const config = new ImportConfigProvider();
      config.orchestration = orchestration;
      config.imports = imports as Imports;
      config.options = options ?? {};
      return config;
    },
  }]
}
