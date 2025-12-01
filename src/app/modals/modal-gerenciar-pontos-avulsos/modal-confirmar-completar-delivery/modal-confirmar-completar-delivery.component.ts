import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-confirmar-completar-delivery',
  templateUrl: './modal-confirmar-completar-delivery.component.html',
  styleUrls: ['./modal-confirmar-completar-delivery.component.scss']
})
export class ModalConfirmarCompletarDeliveryComponent {
  deliveryTitle: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  confirmar() {
    this.activeModal.close(true);
  }

  cancelar() {
    this.activeModal.dismiss();
  }
} 