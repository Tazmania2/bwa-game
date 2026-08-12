import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@app/shared.module';
import { C4uModalModule } from '@components/c4u-modal/c4u-modal.module';
import { C4uKpiCircularProgressModule } from '@components/c4u-kpi-circular-progress/c4u-kpi-circular-progress.module';
import { ModalSeasonNewsComponent } from './modal-season-news.component';

@NgModule({
  declarations: [ModalSeasonNewsComponent],
  exports: [ModalSeasonNewsComponent],
  imports: [
    CommonModule,
    SharedModule,
    C4uModalModule,
    C4uKpiCircularProgressModule,
  ],
})
export class ModalSeasonNewsModule {}
