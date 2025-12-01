import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uAccordionItemComponent} from './c4u-accordion-item.component';
import {SharedModule} from "../../shared.module";

@NgModule({
    declarations: [
        C4uAccordionItemComponent
    ],
    exports: [
        C4uAccordionItemComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ]
})
export class C4uAccordionItemModule {
}
