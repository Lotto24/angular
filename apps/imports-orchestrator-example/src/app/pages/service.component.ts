import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
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
        new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
          console.log('promise resolved')
        )
      ),
      serviceComponent: importStandalone(
        () => import('@lotto24-angular/imports-orchestrator-examples/fruit2')
      ),
    }),
  ],
})
export class ServiceComponent implements AfterViewInit, OnDestroy {
  private readonly importService = inject(ImportService);

  private importFinished = new EventEmitter<void | ComponentRef<unknown>[]>();
  private destroy$ = new Subject<void>();

  @ViewChild('container', { read: ViewContainerRef })
  container!: ViewContainerRef;

  constructor() {
    this.importService.import('servicePromise', NEVER, {
      lifecycle: { importFinished: this.importFinished },
    });

    this.importFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => console.log('import finished'));
    this.destroy$.subscribe(() => console.log('destroyed'));
  }

  public ngAfterViewInit(): void {
    const injector = this.container.injector;
    this.importService.import('serviceComponent', this.destroy$, {
      lifecycle: { importFinished: this.importFinished },
      injector,
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
