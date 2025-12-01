import {Directive, ElementRef, EventEmitter, Output} from "@angular/core";

@Directive({
    selector: '[hoverFunction]'
})
export class HoverFunctionDirective {
    @Output()
    hover = new EventEmitter();

    isHovering = false;

    constructor(el: ElementRef) {
        el.nativeElement.addEventListener('mouseenter', () => {
            if (!this.isHovering) {
                this.hover.emit();
            }

            this.isHovering = true;
        });

        el.nativeElement.addEventListener('mouseleave', () => {
            this.isHovering = false;
        });
    }
}
