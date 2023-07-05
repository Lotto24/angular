import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  ImportsOrchestratorCSSClassDirective,
  ImportsOrchestratorIODirective,
  ImportsOrchestratorLifecycleDirective,
  ImportsOrchestratorQueueDirective,
} from '@lotto24-angular/imports-orchestrator';

@Component({
  selector: 'import',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: ImportsOrchestratorQueueDirective,
      // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
      inputs: ['providers', 'timeout'],
    },
    {
      directive: ImportsOrchestratorIODirective,
      // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
      inputs: ['inputs', 'outputs'],
    },
    {
      directive: ImportsOrchestratorLifecycleDirective,
      // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
      outputs: [
        'importQueued',
        'importStarted',
        'importFinished',
        'importErrored',
      ],
    },
    {
      directive: ImportsOrchestratorCSSClassDirective,
      // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
      inputs: ['cssClass'],
    },
  ],
  template: `<ng-container #container></ng-container>`,
})
export class ImportsOrchestratorComponent implements OnChanges, AfterViewInit {
  @Input()
  public import!: string;

  private readonly queue = inject(ImportsOrchestratorQueueDirective, {
    self: true,
  });

  @ViewChild('container', { read: ViewContainerRef })
  container!: ViewContainerRef;

  public ngOnChanges(changes: SimpleChanges): void {
    const importInput = changes['import'];
    if (
      importInput !== undefined &&
      importInput.currentValue !== importInput.previousValue
    ) {
      this.createAndAddItemToQueue();
    }
  }

  public ngAfterViewInit(): void {
    this.createAndAddItemToQueue();
  }

  private createAndAddItemToQueue(): void {
    if (!this.import || !this.container) {
      return;
    }

    this.queue.viewContainerRef = this.container;
    this.queue.import = this.import;
    this.queue.createAndAddItemToQueue();
  }
}
