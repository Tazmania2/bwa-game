import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmarAprovacaoComponent } from './modal-confirmar-aprovacao.component';

@NgModule({
  declarations: [
    ModalConfirmarAprovacaoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule
  ],
  exports: [
    ModalConfirmarAprovacaoComponent
  ]
})
export class ModalConfirmarAprovacaoModule {} 