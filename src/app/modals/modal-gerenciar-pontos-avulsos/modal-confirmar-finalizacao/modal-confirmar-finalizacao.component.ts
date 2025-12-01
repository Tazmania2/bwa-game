import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-confirmar-finalizacao',
  templateUrl: './modal-confirmar-finalizacao.component.html',
  styleUrls: ['./modal-confirmar-finalizacao.component.scss']
})
export class ModalConfirmarFinalizacaoComponent {
  formFinalizacao: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.formFinalizacao = this.fb.group({
      comentario: ['']
    });
  }

  confirmar() {
    const comentario = this.formFinalizacao.value.comentario;
    this.activeModal.close({ confirmado: true, comentario });
  }

  cancelar() {
    this.activeModal.dismiss();
  }
} 