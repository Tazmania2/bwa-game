import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-distribution-pot',
  templateUrl: './distribution-pot.component.html',
  styleUrls: ['./distribution-pot.component.scss']
})
export class DistributionPotComponent {
  @Input() amount: number = 0;
  @Input() lastUpdate: Date = new Date();
} 