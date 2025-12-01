import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalMotivoCancelamentoComponent } from './modal-motivo-cancelamento.component';

@NgModule({
  declarations: [
    ModalMotivoCancelamentoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule
  ],
  exports: [
    ModalMotivoCancelamentoComponent
  ]
})
export class ModalMotivoCancelamentoModule {} 