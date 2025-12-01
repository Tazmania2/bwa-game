import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {C4uAccordionComponent} from './c4u-accordion.component';
import {SharedModule} from "../../shared.module";

@NgModule({
  declarations: [
    C4uAccordionComponent,
  ],
  exports: [
    C4uAccordionComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class C4uAccordionModule {
}
