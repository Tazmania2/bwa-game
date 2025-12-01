import {Directive, ElementRef, Input, OnChanges, SimpleChanges} from "@angular/core";

@Directive({
    selector: '[marginRight]'
})
export class MarginRightDirective implements OnChanges {
    @Input()
    marginRight: string | number = 0;

    private doChanges() {
        this.el.nativeElement.style.marginRight = (typeof this.marginRight === 'number') ? `${this.marginRight}px` : this.marginRight;
    }

    constructor(private el: ElementRef) {
        this.doChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.doChanges();
    }
}
