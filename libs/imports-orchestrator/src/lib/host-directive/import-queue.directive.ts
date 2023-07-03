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
import { BehaviorSubject, race, Subject } from 'rxjs';
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
  inputs$: Observable<ComponentIO>;
  outputs$: Observable<ComponentIO>;
  destroy$: Observable<void>;
  timeout: number;
}

type ComponentIO = { [index: string]: unknown };

export type ImportsOrchestratorQueueItem = ImportsOrchestratorQueueItemExtras &
  Pick<
    ImportsOrchestratorQueueDirective,
    'import' | 'providers' | 'viewContainerRef' | 'logger'
  >;

@Directive({
  selector: '[importQueue]',
  standalone: true,
})
export class ImportsOrchestratorQueueDirective implements OnChanges, OnDestroy {
  @Input() public import!: string;
  @Input() public orderKey!: string;
  @Input() public providers!: StaticProvider[];
  @Input() public timeout!: number;
  @Output() public importFinished = new EventEmitter<
    ComponentRef<any>[] | void
  >();
  @Output() public importQueued = new EventEmitter<void>();

  public readonly viewContainerRef = inject(ViewContainerRef);
  public destroyQueueDirective$ = new Subject<void>();
  public destroyComponents$ = new Subject<void>();

  private readonly config = inject(ImportsOrchestratorConfig);
  private readonly queueProcessor = inject(ImportsQueueProcessor);
  public readonly logger = this.config.logger;

  private readonly inputs$ = new BehaviorSubject<ComponentIO>({});
  private readonly outputs$ = new BehaviorSubject<ComponentIO>({});

  @Input()
  public set inputs(value: ComponentIO | null) {
    this.inputs$.next(value ?? {});
  }

  @Input()
  public outputs(value: ComponentIO | null) {
    this.outputs$.next(value ?? {});
  }

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
      this.orderKey || this.import
    );

    const injector = Injector.create({
      providers: this.providers ?? [],
      parent: this.viewContainerRef.injector,
    });

    const timeout = this.timeout ?? this.config.timeout;

    this.config.queue.insert(priority, {
      ...this,
      instance: this,
      import: this.import,
      destroy$: race(this.destroyComponents$, this.destroyQueueDirective$),
      inputs$: this.inputs$,
      outputs$: this.outputs$,
      logger: this.logger,
      resolveFn,
      timeout,
      injector,
      priority,
    });

    this.importQueued.emit();

    const orderKeyMessage = this.orderKey ? ` (orderKey=${this.orderKey})` : '';

    this.logger.debug(
      `queue insert @priority=${priority}${orderKeyMessage}, @import=${this.import}`
    );

    this.queueProcessor.process();
  }

  public ngOnDestroy(): void {
    this.destroyQueueDirective$.next();
    this.destroyQueueDirective$.complete();
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
