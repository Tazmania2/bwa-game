import {NgModule} from '@angular/core';
import {MainComponent} from './main.component';
import {SharedModule} from "../../shared.module";
import {RouterModule} from "@angular/router";
import {MainRoutes} from "./main.routing";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ModalSeasonNewsModule} from '@modals/modal-season-news/modal-season-news.module';

@NgModule({
    declarations: [
        MainComponent
    ],
    exports: [
        MainComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild(MainRoutes),
        NgbModule,
        ModalSeasonNewsModule,
    ]
})
export class MainModule {
}
