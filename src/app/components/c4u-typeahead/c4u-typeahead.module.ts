import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uTypeaheadComponent} from './c4u-typeahead.component';
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../../shared.module";


@NgModule({
    declarations: [
        C4uTypeaheadComponent
    ],
    exports: [
        C4uTypeaheadComponent
    ],
    imports: [
        CommonModule,
        NgbTypeahead,
        FormsModule,
        SharedModule
    ]
})
export class C4uTypeaheadModule {
}
