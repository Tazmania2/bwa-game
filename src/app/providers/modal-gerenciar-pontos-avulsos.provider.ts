import { Injectable } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalGerenciarPontosAvulsosComponent } from "../modals/modal-gerenciar-pontos-avulsos/modal-gerenciar-pontos-avulsos.component";

export interface ModalGerenciarPontosAvulsosData {
  timeId?: number;
  userId?: string;
  userName?: string;
  isTeamContext: boolean;
  currentUserEmail?: string;
  initialTab?: 'atribuir' | 'pendentes' | 'finalizados' | 'aprovados' | 'cancelados' | 'incompleto' | 'entregue' | 'processos-pendentes' | 'processos-cancelados';
  initialType?: number; // 0 = Processos, 1 = Tarefas, 2 = Criar
}

@Injectable({
  providedIn: 'root'
})
export class ModalGerenciarPontosAvulsosProvider {

  constructor(private modal: NgbModal) {
  }

  /**
   * Abre o modal de gerenciamento de desafios avulsos
   * @param modalData Dados necessários para configurar o modal
   */
  public abreModal(modalData: ModalGerenciarPontosAvulsosData) {
    const modalRef = this.modal.open(ModalGerenciarPontosAvulsosComponent, { 
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    
    // Configurar as propriedades do modal
    modalRef.componentInstance.timeId = modalData.timeId;
    modalRef.componentInstance.userId = modalData.userId;
    modalRef.componentInstance.userName = modalData.userName;
    modalRef.componentInstance.isTeamContext = modalData.isTeamContext;
    modalRef.componentInstance.currentUserEmail = modalData.currentUserEmail;
    
    // Definir aba inicial (padrão: processos-pendentes)
    modalRef.componentInstance.initialTab = modalData.initialTab || 'processos-pendentes';
    
    // Definir tipo inicial (padrão: Processos)
    modalRef.componentInstance.initialType = modalData.initialType !== undefined ? modalData.initialType : 0;
    
    // Passar dados vazios para satisfazer a condição *ngIf="data"
    modalRef.componentInstance.data = {
      title: 'Gerenciar Desafios Avulsos',
      typeSelected: 0,
      tabSelected: 0,
      types: []
    };
    
    return modalRef;
  }

  /**
   * Abre o modal para contexto de time
   * @param timeId ID do time
   * @param currentUserEmail Email do usuário atual
   * @param initialTab Aba inicial (opcional)
   * @param initialType Tipo inicial (opcional)
   */
  public abreModalTime(timeId: number, currentUserEmail?: string, initialTab?: 'atribuir' | 'pendentes' | 'finalizados' | 'aprovados' | 'cancelados' | 'incompleto' | 'entregue' | 'processos-pendentes', initialType?: number) {
    return this.abreModal({
      timeId,
      isTeamContext: true,
      currentUserEmail,
      initialTab,
      initialType
    });
  }

  /**
   * Abre o modal para contexto de colaborador
   * @param userId ID/Email do usuário
   * @param userName Nome do usuário
   * @param currentUserEmail Email do usuário atual (para ações de aprovar/reprovar/cancelar)
   * @param initialTab Aba inicial (opcional)
   * @param initialType Tipo inicial (opcional)
   */
  public abreModalColaborador(userId: string, userName: string, currentUserEmail?: string, initialTab?: 'atribuir' | 'pendentes' | 'finalizados' | 'aprovados' | 'cancelados' | 'incompleto' | 'entregue' | 'processos-pendentes', initialType?: number) {
    return this.abreModal({
      userId,
      userName,
      isTeamContext: false,
      currentUserEmail,
      initialTab,
      initialType
    });
  }

  /**
   * Abre o modal para visualizar apenas atividades pendentes (tarefas)
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalPendentes(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'pendentes',
      initialType: 1 // Tarefas
    });
  }

  /**
   * Abre o modal para visualizar apenas atividades finalizadas (tarefas)
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalFinalizadas(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'finalizados',
      initialType: 1 // Tarefas
    });
  }

  /**
   * Abre o modal para visualizar apenas atividades aprovadas (tarefas)
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalAprovadas(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'aprovados',
      initialType: 1 // Tarefas
    });
  }

  /**
   * Abre o modal para visualizar apenas atividades canceladas (tarefas)
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalCanceladas(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'cancelados',
      initialType: 1 // Tarefas
    });
  }

  /**
   * Abre o modal para criar novas atividades (tipo "Criar")
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalCriar(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'atribuir',
      initialType: 2 // Criar
    });
  }

  /**
   * Abre o modal para visualizar processos (tipo "Processos")
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalProcessos(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'processos-pendentes',
      initialType: 0 // Processos
    });
  }

  /**
   * Abre o modal para visualizar tarefas (tipo "Tarefas")
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalTarefas(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'pendentes',
      initialType: 1 // Tarefas
    });
  }

  /**
   * Abre o modal para visualizar processos incompletos
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalProcessosIncompletos(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'incompleto',
      initialType: 0 // Processos
    });
  }

  /**
   * Abre o modal para visualizar processos entregues
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalProcessosEntregues(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'entregue',
      initialType: 0 // Processos
    });
  }

  /**
   * Abre o modal para visualizar processos pendentes
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalProcessosPendentes(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'processos-pendentes',
      initialType: 0 // Processos
    });
  }

  /**
   * Abre o modal para visualizar processos cancelados
   * @param timeId ID do time (se contexto de time)
   * @param userId ID do usuário (se contexto de colaborador)
   * @param userName Nome do usuário (se contexto de colaborador)
   * @param isTeamContext Se é contexto de time ou colaborador
   * @param currentUserEmail Email do usuário atual
   */
  public abreModalProcessosCancelados(timeId?: number, userId?: string, userName?: string, isTeamContext: boolean = true, currentUserEmail?: string) {
    return this.abreModal({
      timeId,
      userId,
      userName,
      isTeamContext,
      currentUserEmail,
      initialTab: 'processos-cancelados',
      initialType: 0 // Processos
    });
  }
} 