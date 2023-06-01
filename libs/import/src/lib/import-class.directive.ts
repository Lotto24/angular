import {ComponentRef, Directive, ElementRef, inject, Input, Renderer2} from "@angular/core";
import {ImportQueueDirective} from "./import-queue.directive";
import {takeUntil} from "rxjs";

@Directive({
  selector: '[importClass]',
  standalone: true,
})
export class ImportClassDirective {
  @Input() public withClass!: string

  private readonly queue = inject(ImportQueueDirective, { self: true })

  constructor() {
    this.queue.componentMount
      .pipe(takeUntil(this.queue.destroy$))
      .subscribe((ref) => this.onComponentMount(ref))
  }

  public onComponentMount(componentRef: ComponentRef<unknown>): void {
    if (!this.withClass)
      return;

    const renderer2 = componentRef.injector.get(Renderer2);
    const elementRef = componentRef.injector.get(ElementRef);
    const htmlElement = elementRef.nativeElement as HTMLElement;

    const classes = this.withClass.match(/[^\s]+/ig);
    classes?.forEach((c) => renderer2.addClass(htmlElement, c))
  }
}
