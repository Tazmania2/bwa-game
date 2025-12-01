import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-confirmar-aprovacao',
  templateUrl: './modal-confirmar-aprovacao.component.html',
  styleUrls: ['./modal-confirmar-aprovacao.component.scss']
})
export class ModalConfirmarAprovacaoComponent {
  formAprovacao: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.formAprovacao = this.fb.group({
      comentario: ['']
    });
  }

  confirmar() {
    this.activeModal.close({
      aprovado: true,
      comentario: this.formAprovacao.value.comentario
    });
  }

  cancelar() {
    this.activeModal.dismiss();
  }
} 