import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uPainelInfoComponent} from './c4u-painel-info.component';
import {C4uPainelVidroModule} from "../c4u-painel-vidro/c4u-painel-vidro.module";
import {SharedModule} from "../../shared.module";


@NgModule({
    declarations: [
        C4uPainelInfoComponent
    ],
    exports: [
        C4uPainelInfoComponent
    ],
    imports: [
        CommonModule,
        C4uPainelVidroModule,
        SharedModule
    ]
})
export class C4uPainelInfoModule {
}
