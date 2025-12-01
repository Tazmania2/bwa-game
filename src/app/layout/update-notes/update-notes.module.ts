import { NgModule } from '@angular/core';
// import { UpdateNotesComponent } from './update-notes.component';
import { SharedModule } from "../../shared.module";
import { RouterModule, Routes } from "@angular/router";
import { ReportTableModule } from '../report-table/report-table.module';
import { C4uAnimacaoCidModule } from "../../components/c4u-animacao-cid/c4u-animacao-cid.module";
import { FormsModule } from "@angular/forms";
import { C4uSpinnerModule } from "../../components/c4u-spinner/c4u-spinner.module";


export const UpdateNotesRoutes: Routes = [
  // { path: '', component: UpdateNotesComponent },
];


@NgModule({
  // declarations: [
  //   UpdateNotesComponent
  // ],
  imports: [
    SharedModule,
    RouterModule.forChild(UpdateNotesRoutes),
    C4uAnimacaoCidModule,
    FormsModule,
    C4uSpinnerModule,
    ReportTableModule,
  ]
})
export class UpdateNotesModule {
}

