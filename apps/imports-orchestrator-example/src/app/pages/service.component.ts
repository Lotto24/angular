import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  ImportService,
  ImportsOrchestratorDirective,
  importStandalone,
  provideImports,
} from '@lotto24-angular/imports-orchestrator';
import { NEVER, Subject, takeUntil } from 'rxjs';
import { AppImportsOrchestration } from '../app.config';

@Component({
  selector: 'example-service',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>ImportService</h2>
    <div>container: <ng-container #container></ng-container></div>
  `,
  imports: [ImportsOrchestratorDirective],
  providers: [
    provideImports<AppImportsOrchestration>({
      serviceComponent: importStandalone(
        () => import('@lotto24-angular/imports-orchestrator-examples/fruit2')
      ),
    }),
  ],
})
export class ServiceComponent implements AfterViewInit, OnDestroy {
  private readonly importService = inject(ImportService);

  private injector = inject(Injector);
  private importFinished = new EventEmitter<unknown>();
  private destroy$ = new Subject<void>();

  @ViewChild('container', { read: ViewContainerRef })
  container!: ViewContainerRef;

  constructor() {
    this.importFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => console.log('import finished'));

    this.destroy$.subscribe(() => console.log('service example destroyed'));

    this.importPromise();
  }

  private async importPromise(): Promise<void> {
    const item = this.importService.createQueueItem('servicePromise', NEVER, {
      lifecycle: { importFinished: this.importFinished },
    });

    // you can await the item here, but you don't have to
    try {
      const result = await this.importService.addItemToQueue(item);
      console.log('result', result);
    } catch (e) {
      console.error(e);
    }
  }

  public ngAfterViewInit(): void {
    const injector = this.container.injector;
    const item = this.importService.createQueueItem(
      'serviceComponent',
      this.destroy$,
      {
        lifecycle: { importFinished: this.importFinished },
        injector,
      }
    );
    this.importService.addItemToQueue(item);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
