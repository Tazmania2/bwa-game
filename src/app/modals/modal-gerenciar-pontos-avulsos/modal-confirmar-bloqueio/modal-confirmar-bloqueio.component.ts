import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-confirmar-bloqueio',
  templateUrl: './modal-confirmar-bloqueio.component.html',
  styleUrls: ['./modal-confirmar-bloqueio.component.scss']
})
export class ModalConfirmarBloqueioComponent {
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
