import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uGraficoLinhasComponent} from './c4u-grafico-linhas.component';
import {SharedModule} from "../../shared.module";

@NgModule({
    declarations: [
        C4uGraficoLinhasComponent
    ],
    exports: [
        C4uGraficoLinhasComponent
    ],
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class C4uGraficoLinhasModule {
}
