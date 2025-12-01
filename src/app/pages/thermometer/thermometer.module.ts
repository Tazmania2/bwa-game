import { NgModule } from '@angular/core';
import { SharedModule } from "../../shared.module";
import { RouterModule, Routes } from "@angular/router";
import { ThermometerComponent } from './thermometer.component';
import { C4uCardModule } from "../../components/c4u-card/c4u-card.module";
import { FormsModule } from '@angular/forms';
import { SeasonModule } from '../dashboard/season/season.module';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/services/notification.service';

export const ThermometerRoutes: Routes = [
  { path: 'thermometer', component: ThermometerComponent },
];

@NgModule({
  declarations: [
    ThermometerComponent,

  ],
  imports: [
    SharedModule,
    RouterModule.forChild(ThermometerRoutes),
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
    ThermometerComponent
  ]
})
export class ThermometerModule { } 