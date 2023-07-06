import { Directive, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ImportObservableComponentIO } from '../import.interface';

export type ComponentIO = { [index: string]: unknown };

@Directive({
  selector: '[importLifecycle]',
  standalone: true,
})
export class ImportsOrchestratorIODirective
  implements ImportObservableComponentIO
{
  public readonly inputs$ = new BehaviorSubject<ComponentIO>({});
  public readonly outputs$ = new BehaviorSubject<ComponentIO>({});

  @Input()
  public set inputs(value: ComponentIO | null) {
    this.inputs$.next(value ?? {});
  }

  @Input()
  public set outputs(value: ComponentIO | null) {
    this.outputs$.next(value ?? {});
  }
}
