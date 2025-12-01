import {Directive, ElementRef, Input, OnChanges, SimpleChanges} from "@angular/core";

@Directive({
    selector: '[h]'
})
export class HeightDirective implements OnChanges {
    @Input()
    h: string | number = 0;

    private doChanges() {
        this.el.nativeElement.style.height = (typeof this.h === 'number') ? `${this.h}px` : this.h;
    }

    constructor(private el: ElementRef) {
        this.doChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.doChanges();
    }
}
