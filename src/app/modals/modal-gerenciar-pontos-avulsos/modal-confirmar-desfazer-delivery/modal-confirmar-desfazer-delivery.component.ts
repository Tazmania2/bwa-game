import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-confirmar-desfazer-delivery',
  templateUrl: './modal-confirmar-desfazer-delivery.component.html',
  styleUrls: ['./modal-confirmar-desfazer-delivery.component.scss']
})
export class ModalConfirmarDesfazerDeliveryComponent {
  deliveryTitle: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  confirmar() {
    this.activeModal.close(true);
  }

  cancelar() {
    this.activeModal.dismiss();
  }
} 