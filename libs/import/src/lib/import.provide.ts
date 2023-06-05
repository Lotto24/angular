import {EnvironmentProviders, makeEnvironmentProviders, Provider} from '@angular/core';
import {ImportQueueItemResolveFn} from "./host-directive";
import {
  ANGULAR_IMPORTS_ORCHESTRATOR_IMPORTS,
  AngularImportOrchestratorOptions,
  ImportConfigProvider,
  Orchestration
} from "./provider/import-config.provider";


export function provideImports<T>(
  imports: Partial<{ [key in keyof T]: ImportQueueItemResolveFn }>): Provider {
  return {
    provide: ANGULAR_IMPORTS_ORCHESTRATOR_IMPORTS,
    useValue: imports,
  }
}

export function provideImportsOrchestration<T>(
  orchestration: T & Orchestration,
  options?: Partial<AngularImportOrchestratorOptions>
): EnvironmentProviders {
  return makeEnvironmentProviders([{
    provide: ImportConfigProvider,
    useFactory: () => new ImportConfigProvider(orchestration, options ?? {})
  }]);
}
