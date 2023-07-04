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
import { Subject } from 'rxjs';
import { ImportsOrchestratorConfig } from '../config/import.config';
import { ImportsQueueProcessor } from '../queue/imports-queue-processor.service';
import { ImportsOrchestratorIODirective } from './import-io.directive';
import { ImportsOrchestratorLifecycleDirective } from './import-lifecycle.directive';
import { findImportPriority, findResolveFn } from './util';

export type ImportsOrchestratorQueueItemResolveFn = (
  item: ImportsOrchestratorQueueItem
) => Promise<void>;

export type ImportsOrchestratorQueueExposed = Pick<
  ImportsOrchestratorQueueDirective,
  'io' | 'lifecycle' | 'import' | 'providers' | 'viewContainerRef' | 'destroyComponents$' | 'logger'
>;

export interface ImportsOrchestratorQueueItem
  extends ImportsOrchestratorQueueExposed {
  resolveFn: ImportsOrchestratorQueueItemResolveFn;
  priority: number;
  injector: Injector;
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
    const resolveFn = findResolveFn(
      this.config.imports,
      this.import
    ) as ImportsOrchestratorQueueItemResolveFn;

    const priority = findImportPriority(this.config.orchestration, this.import);

    const injector = Injector.create({
      providers: this.providers ?? [],
      parent: this.viewContainerRef.injector,
    });

    const timeout = this.timeout ?? this.config.timeout;

    this.config.queue.insert(priority, {
      ...(this as ImportsOrchestratorQueueExposed),
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
