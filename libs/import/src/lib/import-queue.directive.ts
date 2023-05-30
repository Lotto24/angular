import type {OnDestroy, OnInit, StaticProvider} from '@angular/core';
import {Directive, ElementRef, Inject, Injector, Input, ViewContainerRef} from '@angular/core';
import type {Observable} from 'rxjs';
import {Subject} from 'rxjs';

import {IMPORT_COMPONENTS, IMPORT_PRIORITIES} from './import.token';
import {ImportQueueProvider} from './import-queue.provider';
import {LOG_PREFIX} from './util/logger';

export type ImportQueueItemResolveFn = (item: ImportQueueItem) => Promise<void>;

interface ImportQueueItemExtras {
  resolveFn: ImportQueueItemResolveFn;
  priority: number;
  injector: Injector;
  destroy$: Observable<void>;
}

export type ImportQueueItem = ImportQueueItemExtras &
  Pick<ImportQueueDirective, 'import' | 'providers' | 'inputs' | 'outputs' | 'viewContainerRef'>;

@Directive({
  selector: '[importQueue]',
  standalone: true,
})
export class ImportQueueDirective implements OnInit, OnDestroy {
  @Input() public import!: string;
  @Input() public orderKey!: string;
  @Input() public providers!: StaticProvider[];
  @Input() public inputs!: { [index: string]: unknown };
  @Input() public outputs!: { [index: string]: unknown };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    @Inject(IMPORT_COMPONENTS) private readonly config: { [key: string]: ImportQueueItemResolveFn }, // migrate config in the future
    @Inject(IMPORT_PRIORITIES) private readonly priorities: { [key: string]: number },
    private readonly injector: Injector,
    public viewContainerRef: ViewContainerRef,
    private readonly queue: ImportQueueProvider
  ) {}

  public ngOnInit(): void {
    const resolveFn = createResolveFn(this.config, this.import);
    const priority = resolveImportPriority(this.priorities, this.orderKey || this.import);

    const injector = Injector.create({
      providers: this.providers ?? [],
      parent: this.injector,
    });

    this.queue.insert(priority, {
      ...this,
      resolveFn: resolveFn,
      import: this.import,
      destroy$: this.destroy$,
      injector,
      priority,
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

function createResolveFn(
  config: { [key: string]: ImportQueueItemResolveFn },
  importId: string,
): ImportQueueItemResolveFn {
  const resolveFn = config[importId];

  if (!resolveFn) {
    throw new Error(`${LOG_PREFIX}: Missing resolve configuration for import: ${importId}`);
  }

  return resolveFn;
}

function resolveImportPriority(priorities: { [key: string]: number }, importId: string): number {
  if (typeof priorities[importId] === 'number') {
    return priorities[importId];
  }

  const key = Object.keys(priorities).find(key => importId.startsWith(key));

  if (key) {
    return priorities[key];
  }

  return 9999;
}
