import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uModalComponent} from './c4u-modal.component';
import {SharedModule} from "../../shared.module";

@NgModule({
    declarations: [
        C4uModalComponent
    ],
    exports: [
        C4uModalComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ]
})
export class C4uModalModule {
}
