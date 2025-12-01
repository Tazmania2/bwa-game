import {Directive, ElementRef, Input, OnInit} from "@angular/core";

@Directive({
  selector: '[scroll]'
})
export class ScrollDirective implements OnInit {
  @Input()
  scroll: string | 'x' | 'y' = '';

  constructor(private el: ElementRef) {

  }

  ngOnInit() {
    if (this.el.nativeElement.classList)
      this.el.nativeElement.classList.add('scroll-style');
    else
      this.el.nativeElement.classList = ['scroll-style']

    const style = this.el.nativeElement.style;
    switch (this.scroll) {
      case "x":
        style.overflowX = 'auto';
        style.overflowY = 'hidden';
        break;
      case "y":
        style.overflowX = 'hidden';
        style.overflowY = 'auto';
        break;
      default:
        style.overflow = 'auto';
    }
  }

}
