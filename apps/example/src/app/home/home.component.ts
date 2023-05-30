import {ChangeDetectionStrategy, Component} from "@angular/core";
import {ImportDirective} from "@angular-import-orchestrator/import";

@Component({
  selector: 'example-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Home</h2>
    <ng-container import="example0"></ng-container>
    <ng-container import="example1"></ng-container>
    <ng-container import="example2"></ng-container>
    <ng-container import="example3"></ng-container>
  `,
  imports: [
    ImportDirective
  ]
})
export class HomeComponent {
}
