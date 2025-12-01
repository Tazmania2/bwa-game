import {Directive, ElementRef, Input, TemplateRef, ViewContainerRef} from "@angular/core";
import {C4uShimmerComponent} from "../../components/c4u-shimmer/c4u-shimmer.component";


@Directive({
    selector: '[enableShimmer]'
})
export class EnableShimmerDirective {
    private hasView = false;

    @Input()
    set enableShimmer(input: [any, { [type: string]: number | string }] | boolean) {
        let value = input;
        if (typeof input == 'object')
            value = input[0];

        if (!value && !this.hasView) {
            this.viewContainer.clear();
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (value) {
            this.viewContainer.clear();
            const component = this.viewContainer.createComponent(C4uShimmerComponent);
            if (typeof input == 'object') {
                Object.keys(input[1]).forEach(k => {
                    const value = input[1][k];
                    component.location.nativeElement.style[k] = (typeof value == 'number') ? `${value}px` : value;
                });
            }
            this.hasView = false;
        }
    }

    constructor(
        private el: ElementRef,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef) {
    }

}
