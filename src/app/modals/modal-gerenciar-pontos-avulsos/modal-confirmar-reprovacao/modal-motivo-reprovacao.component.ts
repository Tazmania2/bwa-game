import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-motivo-reprovacao',
  templateUrl: './modal-motivo-reprovacao.component.html',
  styleUrls: ['./modal-motivo-reprovacao.component.scss']
})
export class ModalMotivoReprovacaoComponent {
  formMotivo: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.formMotivo = this.fb.group({
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  confirmar() {
    if (this.formMotivo.valid) {
      this.activeModal.close(this.formMotivo.value.motivo);
    }
  }

  cancelar() {
    this.activeModal.dismiss();
  }
} 