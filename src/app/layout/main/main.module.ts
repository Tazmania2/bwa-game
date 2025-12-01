import {NgModule} from '@angular/core';
import {MainComponent} from './main.component';
import {SharedModule} from "../../shared.module";
import {RouterModule} from "@angular/router";
import {MainRoutes} from "./main.routing";

@NgModule({
    declarations: [
        MainComponent
    ],
    exports: [
        MainComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild(MainRoutes)
    ]
})
export class MainModule {
}
