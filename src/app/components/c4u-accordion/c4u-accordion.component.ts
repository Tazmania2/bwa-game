import {AfterContentInit, Component, ContentChildren, QueryList} from '@angular/core';
import {C4uAccordionItemComponent} from "../c4u-accordion-item/c4u-accordion-item.component";

@Component({
    selector: 'c4u-accordion',
    templateUrl: './c4u-accordion.component.html',
    styleUrls: ['./c4u-accordion.component.scss']
})
export class C4uAccordionComponent implements AfterContentInit {

    @ContentChildren(C4uAccordionItemComponent)
    items!: QueryList<C4uAccordionItemComponent>

    ngAfterContentInit(): void {
    }

}
