import { Directive, Input } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { ImportObservableComponentIO } from '../interface';

export type ComponentIO = { [index: string]: unknown };

@Directive({
  selector: '[importLifecycle]',
  standalone: true,
})
export class ImportsOrchestratorIODirective
  implements ImportObservableComponentIO
{
  public readonly inputs$ = new ReplaySubject<ComponentIO>(1);
  public readonly outputs$ = new Subject<ComponentIO>();

  @Input()
  public set inputs(value: ComponentIO | null) {
    this.inputs$.next(value ?? {});
  }

  @Input()
  public set outputs(value: ComponentIO | null) {
    this.outputs$.next(value ?? {});
  }
}
