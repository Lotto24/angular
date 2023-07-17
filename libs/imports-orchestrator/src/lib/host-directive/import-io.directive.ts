import { Directive, Input, OnDestroy } from '@angular/core';
import { ReplaySubject, share, Subject, takeUntil } from 'rxjs';
import { ImportObservableComponentIO } from '../interface';

export type ComponentIO = { [index: string]: unknown };

@Directive({
  selector: '[importLifecycle]',
  standalone: true,
})
export class ImportsOrchestratorIODirective
  implements ImportObservableComponentIO, OnDestroy
{
  private readonly destroy$ = new Subject<void>();
  public readonly _inputs = new ReplaySubject<ComponentIO>(1);
  public readonly inputs$ = this._inputs.pipe(
    takeUntil(this.destroy$),
    share()
  );
  public readonly _outputs = new ReplaySubject<ComponentIO>(1);
  public readonly outputs$ = this._outputs.pipe(
    takeUntil(this.destroy$),
    share()
  );

  @Input()
  public set inputs(value: ComponentIO | null) {
    this._inputs.next(value ?? {});
  }

  @Input()
  public set outputs(value: ComponentIO | null) {
    this._outputs.next(value ?? {});
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
