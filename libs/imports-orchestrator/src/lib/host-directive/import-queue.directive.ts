import type {
  ComponentRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  StaticProvider,
} from '@angular/core';
import {
  Directive,
  EventEmitter,
  inject,
  Injector,
  Input,
  Output,
  ViewContainerRef,
} from '@angular/core';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { ImportsOrchestratorConfig } from '../config/import.config';
import { ImportsQueueProcessor } from '../queue/imports-queue-processor.service';

export type ImportsOrchestratorQueueItemResolveFn = (
  item: ImportsOrchestratorQueueItem
) => Promise<void>;

interface ImportsOrchestratorQueueItemExtras {
  resolveFn: ImportsOrchestratorQueueItemResolveFn;
  priority: number;
  instance: ImportsOrchestratorQueueDirective;
  injector: Injector;
  destroy$: Observable<void>;
  timeout: number;
}

export type ImportsOrchestratorQueueItem = ImportsOrchestratorQueueItemExtras &
  Pick<
    ImportsOrchestratorQueueDirective,
    | 'import'
    | 'providers'
    | 'inputs'
    | 'outputs'
    | 'viewContainerRef'
    | 'logger'
  >;

@Directive({
  selector: '[importQueue]',
  standalone: true,
})
export class ImportsOrchestratorQueueDirective implements OnChanges, OnDestroy {
  @Input() public import!: string;
  @Input() public orderKey!: string;
  @Input() public providers!: StaticProvider[];
  @Input() public inputs!: { [index: string]: unknown };
  @Input() public outputs!: { [index: string]: unknown };
  @Input() public timeout!: number;

  @Output() public importFinished = new EventEmitter<
    ComponentRef<any>[] | void
  >();

  public readonly viewContainerRef = inject(ViewContainerRef);
  public readonly destroy$ = new Subject<void>();

  private readonly config = inject(ImportsOrchestratorConfig);
  private readonly queueProcessor = inject(ImportsQueueProcessor);
  public readonly logger = this.config.logger;

  public ngOnChanges(changes: SimpleChanges): void {
    const importInput = changes['import'];
    if (importInput !== undefined && importInput.currentValue !== importInput.previousValue) {
      this.updateImport();
    }
  }

  public updateImport(): void {

    const resolveFn = createResolveFn(this.config.imports, this.import);
    const priority = resolveImportPriority(
      this.config.orchestration,
      this.orderKey || this.import
    );

    const injector = Injector.create({
      providers: this.providers ?? [],
      parent: this.viewContainerRef.injector,
    });

    const timeout = this.timeout ?? this.config.timeout;

    this.viewContainerRef.clear(); // clean up before adding the new component

    this.config.queue.insert(priority, {
      ...this,
      instance: this,
      import: this.import,
      destroy$: this.destroy$,
      logger: this.logger,
      resolveFn,
      timeout,
      injector,
      priority,
    });

    const orderKeyMessage = this.orderKey ? ` (orderKey=${this.orderKey})` : '';

    this.logger.debug(
      `queue insert @priority=${priority}${orderKeyMessage}, @import=${this.import}`
    );

    this.queueProcessor.process();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

function createResolveFn(
  config: { [key: string]: ImportsOrchestratorQueueItemResolveFn },
  importId: string
): ImportsOrchestratorQueueItemResolveFn {
  const resolveFn = config[importId];

  if (!resolveFn) {
    throw new Error(`Missing resolve configuration for import: ${importId}`);
  }

  return resolveFn;
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
