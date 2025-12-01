import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { C4uKpiCircularProgressComponent } from './c4u-kpi-circular-progress.component';
import { C4uPorcentagemCircularModule } from '../c4u-porcentagem-circular/c4u-porcentagem-circular.module';

@NgModule({
  declarations: [C4uKpiCircularProgressComponent],
  imports: [
    CommonModule,
    C4uPorcentagemCircularModule
  ],
  exports: [C4uKpiCircularProgressComponent]
})
export class C4uKpiCircularProgressModule { }
