import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalMotivoReprovacaoComponent } from './modal-motivo-reprovacao.component';

@NgModule({
  declarations: [
    ModalMotivoReprovacaoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule
  ],
  exports: [
    ModalMotivoReprovacaoComponent
  ]
})
export class ModalMotivoReprovacaoModule {} 