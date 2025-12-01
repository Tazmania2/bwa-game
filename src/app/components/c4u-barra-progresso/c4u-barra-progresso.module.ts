import {NgModule} from '@angular/core';
import {C4uBarraProgressoComponent} from './c4u-barra-progresso.component';
import {SharedModule} from "../../shared.module";


@NgModule({
    declarations: [
        C4uBarraProgressoComponent
    ],
    exports: [
        C4uBarraProgressoComponent
    ],
    imports: [
        SharedModule
    ]
})
export class C4uBarraProgressoModule {
}
