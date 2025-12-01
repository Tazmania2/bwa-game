import {Directive, ElementRef, Input, OnChanges, SimpleChanges} from "@angular/core";

@Directive({
    selector: '[marginTop]'
})
export class MarginTopDirective implements OnChanges {
    @Input()
    marginTop: string | number = 0;

    private doChanges() {
        this.el.nativeElement.style.marginTop = (typeof this.marginTop === 'number') ? `${this.marginTop}px` : this.marginTop;
    }

    constructor(private el: ElementRef) {
        this.doChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.doChanges();
    }
}
