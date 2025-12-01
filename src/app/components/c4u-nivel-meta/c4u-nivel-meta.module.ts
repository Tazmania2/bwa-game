import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uNivelMeta} from './c4u-nivel-meta';
import {SharedModule} from "../../shared.module";
import {C4uPainelVidroModule} from "../c4u-painel-vidro/c4u-painel-vidro.module";


@NgModule({
    declarations: [
        C4uNivelMeta
    ],
    exports: [
        C4uNivelMeta
    ],
    imports: [
        CommonModule,
        SharedModule,
        C4uPainelVidroModule
    ]
})
export class C4uNivelMetaModule {
}
