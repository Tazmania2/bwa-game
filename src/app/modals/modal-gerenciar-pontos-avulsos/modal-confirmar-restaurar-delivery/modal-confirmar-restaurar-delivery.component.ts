import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-confirmar-restaurar-delivery',
  templateUrl: './modal-confirmar-restaurar-delivery.component.html',
  styleUrls: ['./modal-confirmar-restaurar-delivery.component.scss']
})
export class ModalConfirmarRestaurarDeliveryComponent {
  deliveryTitle: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  confirmar() {
    this.activeModal.close(true);
  }

  cancelar() {
    this.activeModal.dismiss();
  }
} 