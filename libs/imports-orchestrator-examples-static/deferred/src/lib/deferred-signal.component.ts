import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportedComponentReady } from '@lotto24-angular/imports-orchestrator';

@Component({
  selector: 'imports-orchestrator-examples-static-deferred-component',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Deferred: Signal</div>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferredSignalComponent implements OnInit, ImportedComponentReady {
  private readonly ready = signal(false);

  public ngOnInit(): void {
    setTimeout(() => {
      this.ready.set(true);
    }, 3000);
  }

  public importedComponentReady(): Signal<boolean> {
    return this.ready;
  }
}
