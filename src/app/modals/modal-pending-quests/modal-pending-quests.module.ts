import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModalPendingQuestsComponent} from './modal-pending-quests.component';
import {C4uModalModule} from "../../components/c4u-modal/c4u-modal.module";
import {C4uBotaoSelecaoModule} from "../../components/c4u-botao-selecao/c4u-botao-selecao.module";
import {C4uTabbarModule} from "../../components/c4u-tabbar/c4u-tabbar.module";
import {SharedModule} from "../../shared.module";
import {C4uAccordionModule} from "../../components/c4u-accordion/c4u-accordion.module";
import {C4uAccordionItemModule} from "../../components/c4u-accordion-item/c4u-accordion-item.module";
import {C4uPainelInfoModule} from "../../components/c4u-painel-info/c4u-painel-info.module";
import {C4uPainelVidroModule} from "../../components/c4u-painel-vidro/c4u-painel-vidro.module";
import {C4uSpinnerModule} from "../../components/c4u-spinner/c4u-spinner.module";

@NgModule({
    declarations: [
        ModalPendingQuestsComponent
    ],
    exports: [
        ModalPendingQuestsComponent
    ],
  imports: [
    CommonModule,
    C4uModalModule,
    C4uBotaoSelecaoModule,
    C4uTabbarModule,
    SharedModule,
    C4uAccordionModule,
    C4uAccordionItemModule,
    C4uPainelInfoModule,
    C4uPainelVidroModule,
    C4uSpinnerModule
  ]
})
export class ModalPendingQuestsModule {
}
