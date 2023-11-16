import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportedComponentReady } from '@lotto24-angular/imports-orchestrator';

@Component({
  selector: 'imports-orchestrator-examples-static-deferred-component',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Deferred: Promise</div>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferredPromiseComponent implements ImportedComponentReady {
  public importedComponentReady(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
  }
}
