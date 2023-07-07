import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  ImportsOrchestratorDirective,
  importStandalone,
  provideImports,
} from '@lotto24-angular/imports-orchestrator';
import type { AppImportsOrchestration } from './app.config';

@Component({
  standalone: true,
  imports: [RouterModule, ImportsOrchestratorDirective],
  selector: 'example-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    provideImports<AppImportsOrchestration>({
      footer0: importStandalone(
        () => import('@lotto24-angular/imports-orchestrator-examples/footer0')
      ),
      footer1: importStandalone(
        () => import('@lotto24-angular/imports-orchestrator-examples/footer1')
      ),
      footer2: importStandalone(
        () => import('@lotto24-angular/imports-orchestrator-examples/footer2')
      ),
    }),
  ],
})
export class AppComponent {
  title = 'example';

  private router = inject(Router);

  constructor() {
    this.router.events.subscribe((event) => console.log('router', event));
  }
}
