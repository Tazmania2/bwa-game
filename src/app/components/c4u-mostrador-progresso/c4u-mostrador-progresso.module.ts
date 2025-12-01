import {NgModule} from '@angular/core';
import {C4uMostradorProgressoComponent} from './c4u-mostrador-progresso.component';
import {SharedModule} from "../../shared.module";
import {C4uNivelMetaModule} from "../c4u-nivel-meta/c4u-nivel-meta.module";
import {C4uBarraProgressoModule} from "../c4u-barra-progresso/c4u-barra-progresso.module";
import { animatedProgressBarModule } from '@components/core/c4u-animated-progress-bar/animated-progress-bar.module';

@NgModule({
    declarations: [
        C4uMostradorProgressoComponent
    ],
    exports: [
        C4uMostradorProgressoComponent
    ],
    imports: [
        SharedModule,
        C4uNivelMetaModule,
        C4uBarraProgressoModule,
        animatedProgressBarModule
    ]
})
export class C4uMostradorProgressoModule {
}
