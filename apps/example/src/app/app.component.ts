import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {
  IMPORT_COMPONENTS,
  IMPORT_PRIORITIES,
  ImportDirective,
  importNgModuleBootstrap,
  importStandalone
} from "@angular-import-orchestrator/import";

@Component({
  standalone: true,
  imports: [RouterModule, ImportDirective],
  selector: 'example-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    { provide: IMPORT_PRIORITIES,
      useValue: {
        'example0': 1,
        'example1': 2,
        'example2': 3,
        'example3': 4,
      }
    },
    { provide: IMPORT_COMPONENTS,
      useValue: {
        // just add an import to the ES-Module exporting a standalone component
        'example0': importStandalone(import('@angular-import-orchestrator/examples/example0')),

        // if it contains multiple components, select the standalone component you would like to load
        'example1': importStandalone(import('@angular-import-orchestrator/examples/example1').then(c => c.ExamplesExample1Component)),

        'example2': importStandalone(import('@angular-import-orchestrator/examples/example2')),

        // or import an NgModule with the component referenced in bootstrap
        'example3': importNgModuleBootstrap(import('@angular-import-orchestrator/examples/example3')),
      }
    }
  ]
})
export class AppComponent {
  title = 'example';
}
