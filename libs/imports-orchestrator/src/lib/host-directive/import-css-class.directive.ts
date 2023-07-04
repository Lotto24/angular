import {
  ComponentRef,
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ImportsOrchestratorLifecycleDirective } from './import-lifecycle.directive';

@Directive({
  selector: '[importCSSClass]',
  standalone: true,
})
export class ImportsOrchestratorCSSClassDirective implements OnDestroy {
  @Input() public cssClass!: string;

  private readonly subscriptions = new Subscription();
  private readonly lifecycle = inject(ImportsOrchestratorLifecycleDirective, {
    self: true,
  });

  constructor() {
    this.subscriptions.add(
      this.lifecycle.importFinished.subscribe(this.onImportFinished.bind(this))
    );
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

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
