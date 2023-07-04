import type {
  OnChanges,
  OnDestroy,
  SimpleChanges,
  StaticProvider,
} from '@angular/core';
import {
  Directive,
  inject,
  Injector,
  Input,
  ViewContainerRef,
} from '@angular/core';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import {
  ImportsOrchestratorConfig,
  ImportsOrchestrators,
} from '../config/import.config';
import { ImportsQueueProcessor } from '../queue/imports-queue-processor.service';
import { ImportsOrchestratorIODirective } from './import-io.directive';
import { ImportsOrchestratorLifecycleDirective } from './import-lifecycle.directive';

export type ImportsOrchestratorQueueItemResolveFn = (
  item: ImportsOrchestratorQueueItem
) => Promise<void>;

export type ImportsOrchestratorQueueExposed = Pick<
  ImportsOrchestratorQueueDirective,
  'io' | 'lifecycle' | 'import' | 'providers' | 'viewContainerRef' | 'logger'
>;

export interface ImportsOrchestratorQueueItem
  extends ImportsOrchestratorQueueExposed {
  resolveFn: ImportsOrchestratorQueueItemResolveFn;
  priority: number;
  injector: Injector;
  destroy$: Observable<void>;
  timeout: number;
}

@Directive({
  selector: '[importQueue]',
  standalone: true,
})
export class ImportsOrchestratorQueueDirective implements OnChanges, OnDestroy {
  @Input() public import!: string;
  @Input() public providers!: StaticProvider[];
  @Input() public timeout!: number;

  public readonly io = inject(ImportsOrchestratorIODirective, {
    self: true,
  });
  public readonly lifecycle = inject(ImportsOrchestratorLifecycleDirective, {
    self: true,
  });

  public readonly destroyComponents$ = new Subject<void>();
  public readonly viewContainerRef = inject(ViewContainerRef);
  private readonly config = inject(ImportsOrchestratorConfig);
  public readonly logger = this.config.logger;
  private readonly queueProcessor = inject(ImportsQueueProcessor);

  public ngOnChanges(changes: SimpleChanges): void {
    const importInput = changes['import'];
    if (
      importInput !== undefined &&
      importInput.currentValue !== importInput.previousValue
    ) {
      this.destroyComponents$.next(); // destroy a previously mounted component(s)
      this.updateImport();
    }
  }

  public updateImport(): void {
    const resolveFn = createResolveFn(this.config.imports, this.import);
    const priority = resolveImportPriority(
      this.config.orchestration,
      this.import
    );

    const injector = Injector.create({
      providers: this.providers ?? [],
      parent: this.viewContainerRef.injector,
    });

    const timeout = this.timeout ?? this.config.timeout;

    this.config.queue.insert(priority, {
      ...(this as ImportsOrchestratorQueueExposed),
      destroy$: this.destroyComponents$,
      resolveFn,
      timeout,
      injector,
      priority,
    });

    this.lifecycle.importQueued.emit();

    this.logger.debug(
      `queue insert @priority=${priority}, @import=${this.import}`
    );

    this.queueProcessor.process();
  }

  public ngOnDestroy(): void {
    this.destroyComponents$.next();
    this.destroyComponents$.complete();
  }
}

function createResolveFn(
  config: ImportsOrchestrators,
  importId: string,
  trail: string[] = []
): ImportsOrchestratorQueueItemResolveFn {
  const resolveFnOrString = config[importId];

  if (trail.includes(importId)) {
    throw new Error(
      `circular imports found: ${[...trail, importId].join(' => ')}`
    );
  }

  if (typeof resolveFnOrString === 'string') {
    return createResolveFn(config, resolveFnOrString, [...trail, importId]);
  }

  if (typeof resolveFnOrString === 'function') {
    return resolveFnOrString as ImportsOrchestratorQueueItemResolveFn;
  }

  throw new Error(`Missing resolve configuration for import: ${importId}`);
}

function resolveImportPriority(
  priorities: { [key: string]: number },
  importId: string
): number {
  if (typeof priorities[importId] === 'number') {
    return priorities[importId];
  }

  const key = Object.keys(priorities).find((key) => importId.startsWith(key));

  if (key) {
    return priorities[key];
  }

  return 9999;
}
