import {NgModule} from '@angular/core';
import {C4uSeletorMesComponent} from './c4u-seletor-mes.component';
import {SharedModule} from "../../shared.module";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        C4uSeletorMesComponent
    ],
    exports: [
        C4uSeletorMesComponent
    ],
    imports: [
        SharedModule,
        NgSelectModule,
        FormsModule
    ]
})
export class C4uSeletorMesModule {
}
