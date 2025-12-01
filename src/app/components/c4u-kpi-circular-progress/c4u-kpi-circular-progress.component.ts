import { Component, Input } from '@angular/core';

@Component({
  selector: 'c4u-kpi-circular-progress',
  templateUrl: './c4u-kpi-circular-progress.component.html',
  styleUrls: ['./c4u-kpi-circular-progress.component.scss']
})
export class C4uKpiCircularProgressComponent {
  @Input() label: string = '';
  @Input() current: number = 0;
  @Input() target: number = 0;

  get percentage(): number {
    if (this.target === 0) {
      return 0;
    }
    return Math.round((this.current / this.target) * 100);
  }

  get progressColor(): 'red' | 'gold' | 'green' {
    const percent = this.percentage;
    if (percent >= 80) {
      return 'green';
    }
    if (percent >= 50) {
      return 'gold';
    }
    return 'red';
  }
}
