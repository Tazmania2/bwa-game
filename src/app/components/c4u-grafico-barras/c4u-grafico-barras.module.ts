import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uGraficoBarrasComponent} from './c4u-grafico-barras.component';

@NgModule({
    declarations: [
        C4uGraficoBarrasComponent
    ],
    exports: [
        C4uGraficoBarrasComponent
    ],
    imports: [
        CommonModule,
    ]
})
export class C4uGraficoBarrasModule {
}
