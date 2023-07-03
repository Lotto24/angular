import {
  ComponentRef,
  Directive,
  ElementRef,
  inject,
  Input,
  Renderer2,
} from '@angular/core';
import { ImportsOrchestratorQueueDirective } from './import-queue.directive';
import { takeUntil } from 'rxjs';

@Directive({
  selector: '[importCssClass]',
  standalone: true,
})
export class ImportsOrchestratorClassDirective {
  @Input() public cssClass!: string;

  private readonly queue = inject(ImportsOrchestratorQueueDirective, {
    self: true,
  });

  constructor() {
    this.queue.importFinished
      .pipe(takeUntil(this.queue.destroyQueueDirective$))
      .subscribe((refs) => this.onImportFinished(refs));
  }

  private onImportFinished(
    componentRefs: ComponentRef<unknown>[] | void
  ): void {
    if (!this.cssClass || !componentRefs?.length) return;

    componentRefs.forEach((componentRef) => {
      const renderer2 = componentRef.injector.get(Renderer2);
      const elementRef = componentRef.injector.get(ElementRef);
      const htmlElement = elementRef.nativeElement as HTMLElement;

      const classes = this.cssClass.match(/[^\s]+/gi);
      classes?.forEach((c) => renderer2.addClass(htmlElement, c));
    });
  }
}
