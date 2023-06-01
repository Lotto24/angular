import {ComponentRef, Directive, ElementRef, inject, Input, Renderer2} from "@angular/core";
import {ImportQueueDirective} from "./import-queue.directive";
import {takeUntil} from "rxjs";

@Directive({
  selector: '[importCssClass]',
  standalone: true,
})
export class ImportClassDirective {
  @Input() public cssClass!: string

  private readonly queue = inject(ImportQueueDirective, { self: true })

  constructor() {
    this.queue.componentMount
      // @ts-ignore
      .pipe(takeUntil(this.queue.destroy$))
      .subscribe((ref) => this.onComponentMount(ref))
  }

  public onComponentMount(componentRef: ComponentRef<unknown>): void {
    if (!this.cssClass)
      return;

    const renderer2 = componentRef.injector.get(Renderer2);
    const elementRef = componentRef.injector.get(ElementRef);
    const htmlElement = elementRef.nativeElement as HTMLElement;

    const classes = this.cssClass.match(/[^\s]+/ig);
    classes?.forEach((c) => renderer2.addClass(htmlElement, c))
  }
}
