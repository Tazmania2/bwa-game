import {Directive, ElementRef, Input, OnChanges, SimpleChanges} from "@angular/core";

@Directive({
    selector: '[marginLeft]'
})
export class MarginLeftDirective implements OnChanges {
    @Input()
    marginLeft: string | number = 0;

    private doChanges() {
        this.el.nativeElement.style.marginLeft = (typeof this.marginLeft === 'number') ? `${this.marginLeft}px` : this.marginLeft;
    }

    constructor(private el: ElementRef) {
        this.doChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.doChanges();
    }
}
