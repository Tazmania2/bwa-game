import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uCardComponent} from './c4u-card.component';


@NgModule({
    declarations: [
        C4uCardComponent
    ],
    exports: [
        C4uCardComponent
    ],
    imports: [
        CommonModule
    ]
})
export class C4uCardModule {
}
