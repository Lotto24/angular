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
  Imports,
  ImportService,
  ImportsOrchestratorDirective,
  importStandalone,
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
})
@Imports<AppImportsOrchestration & { servicePromiseBypassingQueue: -1 }>({
  serviceComponent: importStandalone(
    () => import('@lotto24-angular/imports-orchestrator-examples/fruit2')
  ),
  servicePromiseQueued: importPromise(() =>
    fetch('/assets/example.json').then((res) => res.json())
  ),
  servicePromiseBypassingQueue: 'servicePromiseQueued',
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

    this.importServicePromiseQueued();
    this.importServicePromiseBypassingQueue();
  }

  public ngAfterViewInit(): void {
    this.importComponentQueued();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private importComponentQueued(): void {
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

  private async importServicePromiseQueued(): Promise<void> {
    const item = this.importService.createQueueItem(
      'servicePromiseQueued',
      NEVER,
      {
        lifecycle: { importFinished: this.importFinished },
      }
    );

    // you can await the item here, but you don't have to
    try {
      const result = await this.importService.addItemToQueue(item);
      console.log('result for servicePromiseQueued', result);
    } catch (e) {
      console.error(e);
    }
  }

  private async importServicePromiseBypassingQueue(): Promise<any> {
    try {
      const item = this.importService.createQueueItem(
        'servicePromiseBypassingQueue',
        NEVER,
        {
          lifecycle: { importFinished: this.importFinished },
        }
      );
      const result = await this.importService.bypassQueue(item);
      console.log('result for servicePromiseBypassingQueue', result);
      return result;
    } catch (e) {
      console.error(e);
    }
  }
}
