import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'imports-orchestrator-examples-fruit1-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imports-orchestrator-examples-fruit1.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportsOrchestratorExamplesFruit1Component {}
