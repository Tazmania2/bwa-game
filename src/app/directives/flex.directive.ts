import {Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";

@Directive({
    selector: '[flex]'
})
export class FlexDirective implements OnInit, OnChanges {
    @Input()
    direction: 'column' | 'row' = 'row';

    @Input()
    gap: string | number | null = null;

    @Input()
    hAlign: string | null = null;

    @Input()
    vAlign: string | null = null;

    @Input()
    wrap: 'wrap' | 'nowrap' | null = null;

    constructor(private element: ElementRef) {
    }

    ngOnInit(): void {
        this.doChanges();
    }

    private doChanges() {
        const style = this.element.nativeElement.style;
        style.display = 'flex';
        style.flexDirection = this.direction;
        style.gap = (typeof this.gap === 'number') ? `${+this.gap}px` : this.gap;
        style.justifyContent = this.hAlign;
        style.alignItems = this.vAlign;
        style.flexWrap = this.wrap;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.doChanges();
    }
}
