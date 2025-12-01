import { NgModule } from '@angular/core';
import { SharedModule } from "../../shared.module";
import { RouterModule, Routes } from "@angular/router";
import { RewardsComponent } from './rewards.component';
import { C4uCardModule } from "../../components/c4u-card/c4u-card.module";
import { FormsModule } from '@angular/forms';
import { RewardsMetricsComponent } from './components/rewards-metrics/rewards-metrics.component';
import { DistributionPotComponent } from './components/distribution-pot/distribution-pot.component';
import { RewardsStoreComponent } from './components/rewards-store/rewards-store.component';
import { SeasonModule } from '../dashboard/season/season.module';
import { RewardRedeemModalComponent } from './components/reward-redeem-modal/reward-redeem-modal.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/services/notification.service';
import { ConvertPointsModalComponent } from './components/convert-points-modal/convert-points-modal.component';

export const RewardsRoutes: Routes = [
  { path: 'rewards', component: RewardsComponent },
];

@NgModule({
  declarations: [
    RewardsComponent,
    RewardsMetricsComponent,
    DistributionPotComponent,
    RewardsStoreComponent,
    RewardRedeemModalComponent,
    ConvertPointsModalComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(RewardsRoutes),
    C4uCardModule,
    FormsModule,
    SeasonModule,
    CommonModule,
    NgbModule,
    TranslateModule,
    MatSnackBarModule
  ],
  providers: [
    NotificationService
  ],
  exports: [
    RewardsComponent
  ]
})
export class RewardsModule { } 