import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {C4uSpinnerComponent} from './c4u-spinner.component';


@NgModule({
    declarations: [
        C4uSpinnerComponent
    ],
    exports: [
        C4uSpinnerComponent
    ],
    imports: [
        CommonModule,
        NgOptimizedImage
    ]
})
export class C4uSpinnerModule {
}
