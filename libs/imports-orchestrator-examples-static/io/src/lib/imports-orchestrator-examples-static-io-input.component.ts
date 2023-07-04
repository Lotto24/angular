import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'imports-orchestrator-examples-static-component-io-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imports-orchestrator-examples-static-io-input.component.html',
  styles: [],
})
export class ImportsOrchestratorExamplesStaticIoInputComponent implements AfterViewInit {
  @Input()
  public test!: string;
  
  @Input()
  public changing!: number;
  
  @Output()
  public testChange = new EventEmitter<string>();

  public ngAfterViewInit(): void {
    this.testChange.emit('is working!');
  }
}
