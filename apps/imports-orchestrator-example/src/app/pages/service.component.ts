import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  importPromise,
  ImportService,
  ImportsOrchestratorDirective,
  importStandalone,
  provideImports,
} from '@lotto24-angular/imports-orchestrator';
import type { AppImportsOrchestration } from '../app.config';
import { NEVER, Subject, takeUntil } from 'rxjs';

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
      servicePromise: importPromise(() =>
        new Promise((resolve) =>
          setTimeout(() => resolve('promised value'), 1000)
        ).then((value) => {
          console.log('then', value);
          return value;
        })
      ),
      serviceComponent: importStandalone(
        () => import('@lotto24-angular/imports-orchestrator-examples/fruit2')
      ),
    }),
  ],
})
export class ServiceComponent implements AfterViewInit, OnDestroy {
  private readonly importService = inject(ImportService);

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
