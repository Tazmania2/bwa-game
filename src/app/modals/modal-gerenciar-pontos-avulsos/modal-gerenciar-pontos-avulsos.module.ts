import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalGerenciarPontosAvulsosComponent } from './modal-gerenciar-pontos-avulsos.component';
import { ModalConfirmarAprovacaoModule } from './modal-confirmar-aprovacao/modal-confirmar-aprovacao.module';
import { ModalMotivoReprovacaoModule } from './modal-confirmar-reprovacao/modal-motivo-reprovacao.module';
import { ModalMotivoCancelamentoModule } from './modal-confirmar-cancelamento/modal-motivo-cancelamento.module';
import { ModalConfirmarBloqueioModule } from './modal-confirmar-bloqueio/modal-confirmar-bloqueio.module';
import { C4uModalModule } from 'src/app/components/c4u-modal/c4u-modal.module';
import { C4uBotaoSelecaoModule } from 'src/app/components/c4u-botao-selecao/c4u-botao-selecao.module';
import { C4uSpinnerModule } from 'src/app/components/c4u-spinner/c4u-spinner.module';
import { C4uPainelFiltrosAcaoModule } from 'src/app/components/c4u-painel-filtros-acao/c4u-painel-filtros-acao.module';
import { C4uCheckboxModule } from 'src/app/components/c4u-checkbox/c4u-checkbox.module';

// Novos modais de confirmação para delivery
import { ModalConfirmarCancelarDeliveryComponent } from './modal-confirmar-cancelar-delivery/modal-confirmar-cancelar-delivery.component';
import { ModalConfirmarCompletarDeliveryComponent } from './modal-confirmar-completar-delivery/modal-confirmar-completar-delivery.component';
import { ModalConfirmarDesfazerDeliveryComponent } from './modal-confirmar-desfazer-delivery/modal-confirmar-desfazer-delivery.component';
import { ModalConfirmarRestaurarDeliveryComponent } from './modal-confirmar-restaurar-delivery/modal-confirmar-restaurar-delivery.component';

// Modal de confirmação de finalização
import { ModalConfirmarFinalizacaoComponent } from './modal-confirmar-finalizacao/modal-confirmar-finalizacao.component';

@NgModule({
  declarations: [
    ModalGerenciarPontosAvulsosComponent,
    ModalConfirmarCancelarDeliveryComponent,
    ModalConfirmarCompletarDeliveryComponent,
    ModalConfirmarDesfazerDeliveryComponent,
    ModalConfirmarRestaurarDeliveryComponent,
    ModalConfirmarFinalizacaoComponent
  ],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    NgbModule,
    ModalConfirmarAprovacaoModule,
    ModalMotivoReprovacaoModule,
    ModalMotivoCancelamentoModule,
    ModalConfirmarBloqueioModule,
    C4uModalModule,
    C4uBotaoSelecaoModule,
    C4uSpinnerModule,
    C4uPainelFiltrosAcaoModule,
    C4uCheckboxModule
  ],
  exports: [ModalGerenciarPontosAvulsosComponent],
})
export class ModalGerenciarPontosAvulsosModule {} 