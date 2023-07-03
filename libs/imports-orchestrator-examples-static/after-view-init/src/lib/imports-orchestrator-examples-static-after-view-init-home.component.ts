import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, firstValueFrom, map, mapTo, switchMap, timer } from 'rxjs';

@Component({
  selector: 'after-view-init-home-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imports-orchestrator-examples-static-after-view-init-home.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportsOrchestratorExamplesStaticAfterViewInitHomeComponent implements AfterViewInit {
  private ready$ = new Subject<void>();

  public ngAfterViewInit(): void {
    this.ready$.next();
  }

  public importedComponentReady = (): Promise<void> => {
    return firstValueFrom(this.ready$.pipe(switchMap(() => timer(Math.random() * 2000 + 3000)), mapTo(undefined)));
  };
}
