import {NgModule} from '@angular/core';
import {C4uSeletorItemComponent} from './c4u-seletor-item.component';
import {SharedModule} from "../../shared.module";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    C4uSeletorItemComponent
  ],
  exports: [
    C4uSeletorItemComponent
  ],
  imports: [
    SharedModule,
    NgSelectModule,
    FormsModule
  ]
})
export class C4uSeletorItemModule { }
