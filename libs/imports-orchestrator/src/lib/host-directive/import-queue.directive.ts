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
import { ImportsOrchestratorConfig, Logger } from '../config/import.config';
import { ImportsQueueProcessor } from '../queue/imports-queue-processor.service';
import { ImportsOrchestratorIODirective } from './import-io.directive';
import { ImportsOrchestratorLifecycleDirective } from './import-lifecycle.directive';
import { findFn, findImportPriority } from './util';
import { ImportLifecycle } from '../import.service';

export type ImportsOrchestratorQueueItemResolveFn = (
  item: ImportsOrchestratorQueueItem
) => Promise<void>;

export type ImportsOrchestratorQueueExposed = Pick<
  ImportsOrchestratorQueueDirective,
  | 'io'
  | 'lifecycle'
  | 'import'
  | 'providers'
  | 'viewContainerRef'
  | 'destroyComponents$'
  | 'logger'
>;

export type ImportsOrchestratorQueueItem = {
  import: string;
  resolveFn: ImportsOrchestratorQueueItemResolveFn;
  priority: number;
  injector: Injector;
  lifecycle: ImportLifecycle;
  timeout: number;
  logger: Logger;
};

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

  private item: ImportsOrchestratorQueueItem | null = null;

  public ngOnChanges(changes: SimpleChanges): void {
    const importInput = changes['import'];
    if (
      importInput !== undefined &&
      importInput.currentValue !== importInput.previousValue
    ) {
      this.clearQueuedItem();
      this.destroyComponents$.next(); // destroy a previously mounted component(s)
      this.item = this.createQueueItem();
      this.addItemToQueue(this.item);
    }
  }

  private createQueueItem(): ImportsOrchestratorQueueItem {
    const injector = Injector.create({
      providers: this.providers ?? [],
      parent: this.viewContainerRef.injector,
    });

    const resolveFn = findFn(this.config.imports, this.import);

    const priority = findImportPriority(
      this.config.orchestration,
      this.import,
      this.logger
    );

    const timeout = this.timeout ?? this.config.timeout;

    return {
      ...(this as ImportsOrchestratorQueueExposed),
      resolveFn,
      timeout,
      injector,
      priority,
    };
  }

  private addItemToQueue(item: ImportsOrchestratorQueueItem): void {
    this.config.queue.insert(item.priority, item);

    this.lifecycle.importQueued.emit();

    this.logger.debug(
      `queue insert @priority=${item.priority}, @import=${this.import}`
    );

    this.queueProcessor.process();
  }

  private clearQueuedItem(): void {
    if (this.item) {
      this.config.queue.take(this.item);
      this.item = null;
    }
  }

  public ngOnDestroy(): void {
    this.clearQueuedItem();
    this.destroyComponents$.next();
    this.destroyComponents$.complete();
  }
}
