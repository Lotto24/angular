import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'imports-orchestrator-examples-footer2-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imports-orchestrator-examples-footer2.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportsOrchestratorExamplesFooter2Component {}
