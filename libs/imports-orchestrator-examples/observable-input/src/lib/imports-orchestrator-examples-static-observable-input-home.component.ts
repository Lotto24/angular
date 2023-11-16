import { OnInit, ChangeDetectionStrategy, Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, startWith } from 'rxjs';

@Component({
  selector: 'observable-input-home-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imports-orchestrator-examples-static-observable-input-home.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportsOrchestratorExamplesStaticObservableInputHomeComponent implements OnInit {
  @Input() public testInput$ = new Observable<string>();

  public testInputResult = 'Not working!';

  constructor(private cd: ChangeDetectorRef) {
    console.log('====== Constructor');
    
  }
  
  
  public ngOnInit(): void {
    this.testInput$.pipe(startWith('Not working (startWith)')).subscribe((x) => (this.testInputResult = x));
    console.log('====== Lifecycle hook');

    this.cd.detectChanges()

  }

}
