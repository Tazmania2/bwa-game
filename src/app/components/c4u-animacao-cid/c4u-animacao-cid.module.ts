import {NgModule} from '@angular/core';
import {C4uAnimacaoCidComponent} from './c4u-animacao-cid.component';
import {LottieModule} from "ngx-lottie";
import {SharedModule} from "../../shared.module";
import {C4uSpinnerModule} from "../c4u-spinner/c4u-spinner.module";


@NgModule({
  declarations: [
    C4uAnimacaoCidComponent
  ],
  exports: [
    C4uAnimacaoCidComponent
  ],
  imports: [
    SharedModule,
    LottieModule,
    C4uSpinnerModule
  ]
})
export class C4uAnimacaoCidModule { }
