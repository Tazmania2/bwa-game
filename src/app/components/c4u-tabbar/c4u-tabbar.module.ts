import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uTabbarComponent} from './c4u-tabbar.component';
import {SharedModule} from "../../shared.module";


@NgModule({
    declarations: [
        C4uTabbarComponent
    ],
    exports: [
        C4uTabbarComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ]
})
export class C4uTabbarModule {
}
