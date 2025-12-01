import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { C4uProcessAccordionComponent } from './c4u-process-accordion.component';
import { C4uAccordionModule } from '../c4u-accordion/c4u-accordion.module';
import { C4uAccordionItemModule } from '../c4u-accordion-item/c4u-accordion-item.module';
import { SharedModule } from '@app/shared.module';

@NgModule({
  declarations: [
    C4uProcessAccordionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    C4uAccordionModule,
    C4uAccordionItemModule
  ],
  exports: [
    C4uProcessAccordionComponent
  ]
})
export class C4uProcessAccordionModule { }
