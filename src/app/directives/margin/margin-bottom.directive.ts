import {Directive, ElementRef, Input, OnChanges, SimpleChanges} from "@angular/core";

@Directive({
    selector: '[marginBottom]'
})
export class MarginBottomDirective implements OnChanges {
    @Input()
    marginBottom: string | number = 0;

    private doChanges() {
        this.el.nativeElement.style.marginBottom = (typeof this.marginBottom === 'number') ? `${this.marginBottom}px` : this.marginBottom;
    }

    constructor(private el: ElementRef) {
        this.doChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.doChanges();
    }
}
