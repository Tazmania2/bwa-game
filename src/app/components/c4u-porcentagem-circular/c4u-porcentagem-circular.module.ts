import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uPorcentagemCircularComponent} from './c4u-porcentagem-circular.component';
import {SharedModule} from "../../shared.module";


@NgModule({
    declarations: [
        C4uPorcentagemCircularComponent
    ],
    exports: [
        C4uPorcentagemCircularComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ]
})
export class C4uPorcentagemCircularModule {
}
