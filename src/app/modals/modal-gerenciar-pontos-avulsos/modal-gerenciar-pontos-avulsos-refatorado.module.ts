import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Componente principal refatorado
import { ModalGerenciarPontosAvulsosRefatoradoComponent } from './modal-gerenciar-pontos-avulsos-refatorado.component';

// Módulos de componentes filhos
import { ComponentsModule } from './components/components.module';

// Módulos externos
import { C4uModalModule } from '../../components/c4u-modal/c4u-modal.module';

// Modais de confirmação
import { ModalConfirmarAprovacaoModule } from './modal-confirmar-aprovacao/modal-confirmar-aprovacao.module';
import { ModalMotivoReprovacaoModule } from './modal-confirmar-reprovacao/modal-motivo-reprovacao.module';
import { ModalMotivoCancelamentoModule } from './modal-confirmar-cancelamento/modal-motivo-cancelamento.module';
import { ModalConfirmarBloqueioModule } from './modal-confirmar-bloqueio/modal-confirmar-bloqueio.module';

// Novos modais de confirmação para delivery
import { ModalConfirmarCancelarDeliveryComponent } from './modal-confirmar-cancelar-delivery/modal-confirmar-cancelar-delivery.component';
import { ModalConfirmarCompletarDeliveryComponent } from './modal-confirmar-completar-delivery/modal-confirmar-completar-delivery.component';
import { ModalConfirmarDesfazerDeliveryComponent } from './modal-confirmar-desfazer-delivery/modal-confirmar-desfazer-delivery.component';
import { ModalConfirmarRestaurarDeliveryComponent } from './modal-confirmar-restaurar-delivery/modal-confirmar-restaurar-delivery.component';

// Modal de confirmação de finalização
// import { ModalConfirmarFinalizacaoComponent } from './modal-confirmar-finalizacao/modal-confirmar-finalizacao.component';

@NgModule({
  declarations: [
    ModalGerenciarPontosAvulsosRefatoradoComponent,
    ModalConfirmarCancelarDeliveryComponent,
    ModalConfirmarCompletarDeliveryComponent,
    ModalConfirmarDesfazerDeliveryComponent,
    ModalConfirmarRestaurarDeliveryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    C4uModalModule,
    ComponentsModule,
    ModalConfirmarAprovacaoModule,
    ModalMotivoReprovacaoModule,
    ModalMotivoCancelamentoModule,
    ModalConfirmarBloqueioModule
  ],
  exports: [ModalGerenciarPontosAvulsosRefatoradoComponent],
})
export class ModalGerenciarPontosAvulsosRefatoradoModule { } 