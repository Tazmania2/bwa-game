import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { C4uPainelFiltrosAcaoComponent } from './c4u-painel-filtros-acao.component';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [
    C4uPainelFiltrosAcaoComponent
  ],
  exports: [
    C4uPainelFiltrosAcaoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class C4uPainelFiltrosAcaoModule { }

