import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-motivo-cancelamento',
  templateUrl: './modal-motivo-cancelamento.component.html',
  styleUrls: ['./modal-motivo-cancelamento.component.scss']
})
export class ModalMotivoCancelamentoComponent {
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