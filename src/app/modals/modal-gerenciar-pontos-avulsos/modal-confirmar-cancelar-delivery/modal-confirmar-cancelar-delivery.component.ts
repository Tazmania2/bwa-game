import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-confirmar-cancelar-delivery',
  templateUrl: './modal-confirmar-cancelar-delivery.component.html',
  styleUrls: ['./modal-confirmar-cancelar-delivery.component.scss']
})
export class ModalConfirmarCancelarDeliveryComponent {
  deliveryTitle: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  confirmar() {
    this.activeModal.close(true);
  }

  cancelar() {
    this.activeModal.dismiss();
  }
} 