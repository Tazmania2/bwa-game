import { Injectable } from '@angular/core';
import { PontosAvulsosService } from '../../../services/pontos-avulsos.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmarAprovacaoComponent } from '../modal-confirmar-aprovacao/modal-confirmar-aprovacao.component';
import { ModalConfirmarBloqueioComponent } from '../modal-confirmar-bloqueio/modal-confirmar-bloqueio.component';
import { ModalMotivoCancelamentoComponent } from '../modal-confirmar-cancelamento/modal-motivo-cancelamento.component';
import { ModalMotivoReprovacaoComponent } from '../modal-confirmar-reprovacao/modal-motivo-reprovacao.component';
import { ModalConfirmarCancelarDeliveryComponent } from '../modal-confirmar-cancelar-delivery/modal-confirmar-cancelar-delivery.component';
import { ModalConfirmarCompletarDeliveryComponent } from '../modal-confirmar-completar-delivery/modal-confirmar-completar-delivery.component';
import { ModalConfirmarDesfazerDeliveryComponent } from '../modal-confirmar-desfazer-delivery/modal-confirmar-desfazer-delivery.component';
import { ModalConfirmarRestaurarDeliveryComponent } from '../modal-confirmar-restaurar-delivery/modal-confirmar-restaurar-delivery.component';
import { ModalConfirmarFinalizacaoComponent } from '../modal-confirmar-finalizacao/modal-confirmar-finalizacao.component';

@Injectable({
  providedIn: 'root'
})
export class ModalActionsService {
  constructor(
    private pontosAvulsosService: PontosAvulsosService,
    private modalService: NgbModal
  ) {}

  async atribuirAtividade(formData: any, isTeamContext: boolean, userId?: string, atividades: any[] = [], jogadores: any[] = []) {
    const atividadeSelecionada = atividades.find(a => a.id === formData.atividade);
    
    if (!atividadeSelecionada) {
      throw new Error('Atividade não encontrada');
    }

    let userEmail: string | null;
    if (isTeamContext) {
      // Verificar se foi selecionado "Unassigned"
      if (formData.jogador === 'UNASSIGNED') {
        userEmail = null;
      } else {
        const jogadorSelecionado = jogadores.find(j => 
          (j.id || j._id || j.email) === formData.jogador
        );
        userEmail = jogadorSelecionado?.email || 'usuario@exemplo.com';
      }
    } else {
      userEmail = userId || 'usuario@exemplo.com';
    }

    let finishedAt: string | undefined;
    if (formData.status === 'DONE' && formData.dataFinalizacao) {
      finishedAt = new Date(formData.dataFinalizacao).toISOString();
    }

    const payload = this.pontosAvulsosService.createProcessPayload(
      atividadeSelecionada.id,
      userEmail,
      formData.delivery_id || '',
      formData.delivery_title || '',
      formData.status,
      finishedAt
    );

    return await this.pontosAvulsosService.processAction(payload);
  }

  async finalizarAtividade(atividade: any, currentUserEmail: string) {
    const actionId = await this.getActionId(atividade);
    if (!actionId) {
      throw new Error('Action ID não encontrado');
    }

    const modalRef = this.modalService.open(ModalConfirmarFinalizacaoComponent, { size: 'sm' });
    const result = await modalRef.result.catch(() => false);

    if (result && result.confirmado) {
      const finishedAt = new Date().toISOString();
      
      await this.pontosAvulsosService.finalizarAtividade(
        actionId,
        currentUserEmail,
        finishedAt,
        atividade.delivery_id,
        atividade.delivery_title || '',
        atividade.created_at,
        atividade.integration_id || atividade.delivery_id
      );

      // Adiciona comentário padrão ou o comentário fornecido pelo usuário
      const comentario = result.comentario?.trim() || 'Atividade finalizada com sucesso';
      await this.adicionarComentario(
        atividade.id,
        comentario,
        'FINISH',
        currentUserEmail
      );

      return { status: 'DONE', finished_at: finishedAt };
    }

    throw new Error('Operação cancelada pelo usuário');
  }

  async aprovarAtividade(atividade: any, currentUserEmail: string) {
    const actionId = await this.getActionId(atividade);
    if (!actionId) {
      throw new Error('Action ID não encontrado');
    }

    const modalRef = this.modalService.open(ModalConfirmarAprovacaoComponent, { size: 'sm' });
    const result = await modalRef.result.catch(() => null);

    if (result && result.aprovado) {
      const finishedAt = new Date().toISOString();
      
      await this.pontosAvulsosService.aprovarAtividade(
        actionId,
        currentUserEmail,
        finishedAt,
        atividade.delivery_id,
        atividade.delivery_title || '',
        atividade.created_at,
        atividade.integration_id || atividade.delivery_id
      );

      // Adicionar comentário personalizado se fornecido, senão usar o padrão
      const comentario = result.comentario?.trim() || 'Atividade aprovada com sucesso';
      await this.adicionarComentario(
        atividade.id,
        comentario,
        'APPROVE',
        currentUserEmail
      );

      return { status: 'DONE', finished_at: finishedAt };
    }

    throw new Error('Operação cancelada pelo usuário');
  }

  async bloquearAtividade(atividade: any, currentUserEmail: string) {
    const actionId = await this.getActionId(atividade);
    if (!actionId) {
      throw new Error('Action ID não encontrado');
    }

    const modalRef = this.modalService.open(ModalConfirmarBloqueioComponent, { size: 'sm' });
    const motivo = await modalRef.result.catch(() => null);

    if (motivo) {
      await this.pontosAvulsosService.bloquearAtividadeComComentario(
        actionId,
        currentUserEmail,
        atividade.delivery_id,
        atividade.delivery_title || '',
        atividade.created_at,
        atividade.integration_id || atividade.delivery_id
      );

      await this.adicionarComentario(
        atividade.id,
        motivo,
        'BLOCK',
        currentUserEmail
      );

      return { status: 'DONE', finished_at: new Date().toISOString() };
    }

    throw new Error('Operação cancelada pelo usuário');
  }

  async reprovarAtividade(atividade: any, currentUserEmail: string) {
    const actionId = await this.getActionId(atividade);
    if (!actionId) {
      throw new Error('Action ID não encontrado');
    }

    const modalRef = this.modalService.open(ModalMotivoReprovacaoComponent, { size: 'sm' });
    const motivo = await modalRef.result.catch(() => null);
    
    if (motivo) {
      await this.pontosAvulsosService.reprovarAtividadeComComentario(
        actionId,
        currentUserEmail,
        atividade.delivery_id,
        atividade.delivery_title || '',
        atividade.created_at,
        atividade.integration_id || atividade.delivery_id
      );

      await this.adicionarComentario(
        atividade.id,
        motivo,
        'DENY',
        currentUserEmail
      );

      return { status: 'PENDING', finished_at: undefined };
    }

    throw new Error('Operação cancelada pelo usuário');
  }

  async cancelarAtividade(atividade: any, currentUserEmail: string) {
    const actionId = await this.getActionId(atividade);
    if (!actionId) {
      throw new Error('Action ID não encontrado');
    }

    const modalRef = this.modalService.open(ModalMotivoCancelamentoComponent, { size: 'sm' });
    const motivo = await modalRef.result.catch(() => null);
    
    if (motivo) {
      await this.pontosAvulsosService.cancelarAtividadeComComentario(
        actionId,
        currentUserEmail,
        atividade.delivery_id,
        atividade.delivery_title || '',
        atividade.created_at,
        atividade.integration_id || atividade.delivery_id
      );

      await this.adicionarComentario(
        atividade.id,
        motivo,
        'CANCEL',
        currentUserEmail
      );

      return { dismissed: true, finished_at: new Date().toISOString() };
    }

    throw new Error('Operação cancelada pelo usuário');
  }

  async cancelarDelivery(delivery: any) {
    const modalRef = this.modalService.open(ModalConfirmarCancelarDeliveryComponent, { size: 'sm' });
    modalRef.componentInstance.deliveryTitle = delivery.title || delivery.name || 'N/A';
    
    const result = await modalRef.result.catch(() => false);
    
    if (result) {
      await this.pontosAvulsosService.cancelarDelivery(delivery.id);
      return { status: 'CANCELLED' };
    }

    throw new Error('Operação cancelada pelo usuário');
  }

  async completarDelivery(delivery: any) {
    const modalRef = this.modalService.open(ModalConfirmarCompletarDeliveryComponent, { size: 'sm' });
    modalRef.componentInstance.deliveryTitle = delivery.title || delivery.name || 'N/A';
    
    const result = await modalRef.result.catch(() => false);
    
    if (result) {
      await this.pontosAvulsosService.completarDelivery(delivery.id);
      return { status: 'DELIVERED' };
    }

    throw new Error('Operação cancelada pelo usuário');
  }

  async desfazerDelivery(delivery: any) {
    const modalRef = this.modalService.open(ModalConfirmarDesfazerDeliveryComponent, { size: 'sm' });
    modalRef.componentInstance.deliveryTitle = delivery.title || delivery.name || 'N/A';
    
    const result = await modalRef.result.catch(() => false);
    
    if (result) {
      await this.pontosAvulsosService.desfazerDelivery(delivery.id);
      return { status: 'INCOMPLETE' };
    }

    throw new Error('Operação cancelada pelo usuário');
  }

  async restaurarDelivery(delivery: any) {
    const modalRef = this.modalService.open(ModalConfirmarRestaurarDeliveryComponent, { size: 'sm' });
    modalRef.componentInstance.deliveryTitle = delivery.title || delivery.name || 'N/A';
    
    const result = await modalRef.result.catch(() => false);
    
    if (result) {
      await this.pontosAvulsosService.restaurarDelivery(delivery.id);
      return { status: 'PENDING' };
    }

    throw new Error('Operação cancelada pelo usuário');
  }

  private async getActionId(atividade: any): Promise<string | null> {
    if (atividade.action_id) {
      return atividade.action_id;
    }

    if (atividade.action_title) {
      return await this.pontosAvulsosService.getActionIdByTitle(atividade.action_title);
    }

    return null;
  }

  private async adicionarComentario(
    userActionId: string,
    comment: string,
    commentType: 'CANCEL' | 'BLOCK' | 'FINISH' | 'DENY' | 'APPROVE',
    currentUserEmail: string
  ): Promise<void> {
    await this.pontosAvulsosService.adicionarComentario(
      userActionId,
      comment,
      currentUserEmail,
      commentType
    );
  }
} 