import {NgModule} from '@angular/core';
import {HomeComponent} from './home.component';
import {SharedModule} from "../../shared.module";
import {C4uCardModule} from "../../components/c4u-card/c4u-card.module";
import {DashboardModule} from "../dashboard/dashboard.module";

@NgModule({
    declarations: [
        HomeComponent
    ],
    exports: [
        HomeComponent
    ],
  imports: [
    SharedModule,
    C4uCardModule,
    DashboardModule
  ]
})
export class HomeModule {
}
