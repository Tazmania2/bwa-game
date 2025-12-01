import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCompanyDetailComponent } from './modal-company-detail.component';
import { SharedModule } from '@app/shared.module';
import { C4uModalModule } from '@components/c4u-modal/c4u-modal.module';
import { C4uKpiCircularProgressModule } from '@components/c4u-kpi-circular-progress/c4u-kpi-circular-progress.module';
import { C4uTabbarModule } from '@components/c4u-tabbar/c4u-tabbar.module';
import { C4uSpinnerModule } from '@components/c4u-spinner/c4u-spinner.module';
import { C4uProcessAccordionModule } from '@components/c4u-process-accordion/c4u-process-accordion.module';

@NgModule({
  declarations: [ModalCompanyDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    C4uModalModule,
    C4uKpiCircularProgressModule,
    C4uTabbarModule,
    C4uSpinnerModule,
    C4uProcessAccordionModule
  ],
  exports: [ModalCompanyDetailComponent]
})
export class ModalCompanyDetailModule {}
