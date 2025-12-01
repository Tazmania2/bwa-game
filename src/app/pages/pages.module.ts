import {NgModule} from '@angular/core';
import {SharedModule} from "../shared.module";
import {RouterModule} from "@angular/router";
import {PagesRoutes} from "./pages.routing";
import {DashboardModule} from "./dashboard/dashboard.module";
import {HomeModule} from "./home/home.module";
import {RewardsModule} from "./recompensas/rewards.module";
import { ThermometerModule } from "./thermometer/thermometer.module";

@NgModule({
  declarations: [],
  exports: [],
  imports: [
    SharedModule,
    RouterModule.forChild(PagesRoutes),
    DashboardModule,
    HomeModule,
    RewardsModule,
    ThermometerModule
  ]
})
export class PagesModule {
}
