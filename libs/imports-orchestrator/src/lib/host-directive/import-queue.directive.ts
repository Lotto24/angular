import type {
  ComponentRef,
  OnDestroy,
  OnInit,
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
export class ImportsOrchestratorQueueDirective implements OnInit, OnDestroy {
  @Input() public import!: string;
  @Input() public orderKey!: string;
  @Input() public providers!: StaticProvider[];
  @Input() public inputs!: { [index: string]: unknown };
  @Input() public outputs!: { [index: string]: unknown };
  @Input() public timeout!: number;

  @Output() public componentMount = new EventEmitter<ComponentRef<unknown>>();

  public readonly viewContainerRef = inject(ViewContainerRef);
  public readonly destroy$ = new Subject<void>();

  private readonly config = inject(ImportsOrchestratorConfig);
  public readonly logger = this.config.logger;

  public ngOnInit(): void {
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
      destroy$: this.destroy$,
      logger: this.logger,
      resolveFn,
      timeout,
      injector,
      priority,
    });

    this.logger.debug(
      `queue insert w/ priority=${priority}, import=${this.import}`
    );
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
