import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { C4uCheckboxComponent } from './c4u-checkbox.component';

@NgModule({
  declarations: [
    C4uCheckboxComponent
  ],
  exports: [
    C4uCheckboxComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class C4uCheckboxModule { }

