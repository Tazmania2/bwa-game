import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { C4uKpiCircularProgressModule } from '@components/c4u-kpi-circular-progress/c4u-kpi-circular-progress.module';
import { C4uWeeklyGoalBreakdownComponent } from './c4u-weekly-goal-breakdown.component';

@NgModule({
  declarations: [C4uWeeklyGoalBreakdownComponent],
  imports: [CommonModule, C4uKpiCircularProgressModule],
  exports: [C4uWeeklyGoalBreakdownComponent],
})
export class C4uWeeklyGoalBreakdownModule {}
