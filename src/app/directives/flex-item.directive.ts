import {Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";

@Directive({
    selector: '[flexItem]'
})
export class FlexItemDirective implements OnInit, OnChanges {
    @Input()
    flexItem: string | number = '';

    @Input()
    alignSelf: string = '';

    constructor(private element: ElementRef) {
    }

    ngOnInit(): void {
        this.doChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.doChanges();
    }

    private doChanges() {
        const style = this.element.nativeElement.style;
        if (typeof this.flexItem === 'number')
            style.flex = `0 0 ${this.flexItem}px`;
        else
            style.flex = this.flexItem;

        style.alignSelf = this.alignSelf;
    }
}
