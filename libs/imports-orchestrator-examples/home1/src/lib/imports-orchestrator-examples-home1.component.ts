import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'imports-orchestrator-examples-home1-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imports-orchestrator-examples-home1.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportsOrchestratorExamplesHome1Component {}
