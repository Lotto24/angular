import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'imports-orchestrator-examples-static-component-io-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imports-orchestrator-examples-static-io-input.component.html',
  styles: [],
})
export class ImportsOrchestratorExamplesStaticIoInputComponent {
  @Input()
  public test!: string;

  @Input()
  public changing!: number;
}
