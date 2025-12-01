import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmarBloqueioComponent } from './modal-confirmar-bloqueio.component';

@NgModule({
  declarations: [
    ModalConfirmarBloqueioComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule
  ],
  exports: [
    ModalConfirmarBloqueioComponent
  ]
})
export class ModalConfirmarBloqueioModule {}
