import { Component, Input } from '@angular/core';
import { ActivityMetrics, MacroMetrics } from '@model/gamification-dashboard.model';

@Component({
  selector: 'c4u-activity-progress',
  templateUrl: './c4u-activity-progress.component.html',
  styleUrls: ['./c4u-activity-progress.component.scss']
})
export class C4uActivityProgressComponent {
  @Input() activities: ActivityMetrics = {
    pendentes: 0,
    emExecucao: 0,
    finalizadas: 0,
    pontos: 0
  };

  @Input() macros: MacroMetrics = {
    pendentes: 0,
    incompletas: 0,
    finalizadas: 0
  };
}
