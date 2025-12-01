import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { RankingComponent } from './ranking.component';
import { SharedModule } from '../../shared.module';
import { C4uCardModule } from '../../components/c4u-card/c4u-card.module';

const routes = [
  { path: '', component: RankingComponent }
];

@NgModule({
  declarations: [
    RankingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    TranslateModule,
    SharedModule,
    C4uCardModule,
    RouterModule.forChild(routes)
  ]
})
export class RankingModule { }
