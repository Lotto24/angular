import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, delay, Observable } from 'rxjs';
import { ImportedComponentReady } from '@lotto24-angular/imports-orchestrator';

@Component({
  selector: 'imports-orchestrator-examples-static-deferred-component',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Deferred: Observable</div>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferredObservableComponent
  implements OnInit, ImportedComponentReady
{
  private readonly readySubject = new BehaviorSubject(false);

  public ngOnInit(): void {
    this.readySubject.next(true);
  }

  public importedComponentReady(): Observable<boolean> {
    return this.readySubject.pipe(delay(3000));
  }
}
