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
import { ImportsOrchestratorIODirective } from './import-io.directive';
import { ImportsOrchestratorLifecycleDirective } from './import-lifecycle.directive';
import {
  ImportService,
  ImportServiceOptions,
  ImportsOrchestratorQueueItem,
} from '../service';

type ImportsOrchestratorQueueDirectiveExposed = Pick<
  ImportServiceOptions,
  'io' | 'lifecycle'
>;

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
  public viewContainerRef = inject(ViewContainerRef);

  private readonly importService = inject(ImportService);

  private item: ImportsOrchestratorQueueItem | null = null;

  public ngOnChanges(changes: SimpleChanges): void {
    const importInput = changes['import'];
    if (
      importInput !== undefined &&
      importInput.currentValue !== importInput.previousValue
    ) {
      this.createAndAddItemToQueue();
    }
  }

  public createAndAddItemToQueue(): void {
    this.removeItemFromQueue();
    this.destroyComponents$.next(); // destroy a previously mounted component(s)

    const injector = Injector.create({
      providers: this.providers ?? [],
      parent: this.viewContainerRef.injector,
    });

    this.item = this.importService.createQueueItem(
      this.import,
      this.destroyComponents$,
      {
        ...(this as ImportsOrchestratorQueueDirectiveExposed),
        injector,
        lifecycle: this.lifecycle,
      }
    );

    this.importService.addItemToQueue(this.item);
  }

  private removeItemFromQueue(): void {
    if (this.item) {
      this.importService.removeItemFromQueue(this.item);
      this.item = null;
    }
  }

  public ngOnDestroy(): void {
    this.removeItemFromQueue();
    this.destroyComponents$.next();
    this.destroyComponents$.complete();
  }
}
