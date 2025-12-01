import {Directive, ElementRef, Input, OnChanges, SimpleChanges} from "@angular/core";

@Directive({
    selector: '[hover]'
})
export class HoverDirective implements OnChanges {
    @Input()
    hover: boolean | '' = true;

    isHovering = false;

    constructor(private el: ElementRef) {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.hover = (this.hover === '') ? true : this.hover;

        if (this.hover) {
            this.el.nativeElement.addEventListener('mouseenter', this.mouseEnterEvent);
            this.el.nativeElement.addEventListener('mouseleave', this.mouseLeaveEvent);
        } else {
            this.el.nativeElement.classList.remove('hover');
            this.el.nativeElement.removeEventListener('mouseenter', this.mouseEnterEvent);
            this.el.nativeElement.removeEventListener('mouseleave', this.mouseLeaveEvent);
        }
    }

    mouseLeaveEvent = () => {
        this.isHovering = false;
        this.el.nativeElement.classList.remove('hover');
    };

    mouseEnterEvent = () => {
        if (!this.isHovering) {
            this.el.nativeElement.classList.add('hover');
        }

        this.isHovering = true;
    };
}
