import {NgModule} from '@angular/core';
import {SharedModule} from "@app/shared.module";
import {RouterModule, Routes} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {C4uSpinnerModule} from "@components/c4u-spinner/c4u-spinner.module";
import {LoginComponent} from "@layout/login/login.component";
import { C4uCardModule } from '@components/c4u-card/c4u-card.module';


export const LoginRoutes: Routes = [
  { path: '', component: LoginComponent },
];

@NgModule({
  declarations: [
    LoginComponent
  ],
    imports: [
        SharedModule,
        RouterModule.forChild(LoginRoutes),
        FormsModule,
        C4uSpinnerModule,
        ReactiveFormsModule,
        C4uCardModule
    ]
})
export class LoginModule {
}
