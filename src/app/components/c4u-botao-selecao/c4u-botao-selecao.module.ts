import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uBotaoSelecaoComponent} from './c4u-botao-selecao.component';
import {SharedModule} from "../../shared.module";


@NgModule({
    declarations: [
        C4uBotaoSelecaoComponent
    ],
    exports: [
        C4uBotaoSelecaoComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ]
})
export class C4uBotaoSelecaoModule {
}
