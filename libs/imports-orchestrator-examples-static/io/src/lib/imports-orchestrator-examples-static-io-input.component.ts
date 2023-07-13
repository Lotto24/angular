import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, startWith } from 'rxjs';

@Component({
  selector: 'imports-orchestrator-examples-static-component-io-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imports-orchestrator-examples-static-io-input.component.html',
  styles: [],
})
export class ImportsOrchestratorExamplesStaticIoInputComponent
  implements AfterViewInit
{
  private _test!: string;

  public get test(): string {
    return this._test;
  }

  @Input()
  public set test(value: string) {
    console.info('set test', value);
    this._test = value;
  }

  private _changing!: number;

  public get changing(): number {
    return this._changing;
  }

  @Input()
  public set changing(value: number) {
    this._changing = value;
    console.info('set changing', value);
  }

  @Output()
  public testChange = new EventEmitter<string>();

  public ngAfterViewInit(): void {
    interval(3000)
      .pipe(startWith(-1))
      .subscribe((value) => this.testChange.emit(`output value=${value}`));
  }
}
