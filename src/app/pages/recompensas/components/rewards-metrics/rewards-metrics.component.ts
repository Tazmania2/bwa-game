import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConvertPointsModalComponent } from '../convert-points-modal/convert-points-modal.component';

@Component({
  selector: 'app-rewards-metrics',
  templateUrl: './rewards-metrics.component.html',
  styleUrls: ['./rewards-metrics.component.scss']
})
export class RewardsMetricsComponent {
  @Input() coins: number = 0;
  @Input() points: number = 0;
  @Input() price: number = 0;

  constructor(private modalService: NgbModal) {}

  openConvertPointsModal() {
    this.modalService.open(ConvertPointsModalComponent, { size: 'md', centered: true });
  }
} 