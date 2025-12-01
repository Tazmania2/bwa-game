import {Directive, ElementRef} from "@angular/core";

@Directive({
    selector: '[full]'
})
export class FullDirective {
    constructor(element: ElementRef) {
        element.nativeElement.style.boxSizing = 'border-box';
        element.nativeElement.style.width = '100%';
        element.nativeElement.style.height = '100%';
    }
}
