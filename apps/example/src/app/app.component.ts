import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ImportDirective, importStandalone, provideImports} from "@lotto24/angular-import-orchestrator";
import type {AppImportsOrchestration} from "./app.config";

@Component({
  standalone: true,
  imports: [RouterModule, ImportDirective],
  selector: 'example-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [provideImports<AppImportsOrchestration>({
    'footer0': importStandalone(() => import('@angular-import-orchestrator/examples/footer0')),
    'footer1': importStandalone(() => import('@angular-import-orchestrator/examples/footer1')),
    'footer2': importStandalone(() => import('@angular-import-orchestrator/examples/footer2')),
  })]
})
export class AppComponent {
  title = 'example';
}
