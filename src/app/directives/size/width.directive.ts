import {Directive, ElementRef, Input, OnChanges, SimpleChanges} from "@angular/core";

@Directive({
    selector: '[w]'
})
export class WidthDirective implements OnChanges {
    @Input()
    w: string | number = 0;

    private doChanges() {
        this.el.nativeElement.style.width = (typeof this.w === 'number') ? `${this.w}px` : this.w;
    }

    constructor(private el: ElementRef) {
        this.doChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.doChanges();
    }
}
