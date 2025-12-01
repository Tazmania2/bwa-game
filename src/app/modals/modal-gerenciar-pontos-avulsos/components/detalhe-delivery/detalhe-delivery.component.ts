import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export type CorDetalheDelivery = 'vermelho' | 'verde' | 'azul' | 'cinza' | 'amarelo';

@Component({
  selector: 'app-detalhe-delivery',
  templateUrl: './detalhe-delivery.component.html',
  styleUrls: ['./detalhe-delivery.component.scss']
})
export class DetalheDeliveryComponent implements OnInit {
  @Input() delivery: any = null;
  @Input() cor: CorDetalheDelivery = 'vermelho';
  @Input() aliases: any;
  @Input() isAdminOrGerente = false;
  @Output() voltar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() completar = new EventEmitter<void>();
  @Output() desfazer = new EventEmitter<void>();
  @Output() restaurar = new EventEmitter<void>();
  @Output() criarTarefa = new EventEmitter<void>();

  // Normalizar o campo de tarefas
  get tarefas() {
    if (!this.delivery) return [];
    
    if (Array.isArray(this.delivery.user_action)) {
      return this.delivery.user_action;
    }
    
    if (Array.isArray(this.delivery.user_actions)) {
      return this.delivery.user_actions;
    }
    
    return [];
  }

  constructor() {}

  ngOnInit() {
    // Normalizar o campo de tarefas se necessário
    if (this.delivery && !Array.isArray(this.delivery.user_action)) {
      if (Array.isArray(this.delivery.user_actions)) {
        this.delivery.user_action = this.delivery.user_actions;
      } else {
        this.delivery.user_action = [];
      }
    }
  }

  // ===== MÉTODOS DE AÇÕES =====

  onVoltar() {
    this.voltar.emit();
  }

  onCancelar() {
    this.cancelar.emit();
  }

  onCompletar() {
    this.completar.emit();
  }

  onDesfazer() {
    this.desfazer.emit();
  }

  onRestaurar() {
    this.restaurar.emit();
  }

  onCriarTarefa() {
    this.criarTarefa.emit();
  }

  // ===== MÉTODOS AUXILIARES =====

  formatEmailToName(email: string | undefined): string {
    if (!email) return 'N/A';
    
    // Remove a parte do domínio do email
    const namePart = email.split('@')[0];
    
    // Verifica se o nome contém um ponto final
    if (namePart.includes('.')) {
      // Se contém ponto, separa por ponto e capitaliza ambas as partes
      const parts = namePart.split('.');
      return parts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    } else {
      // Se não contém ponto, capitaliza somente o primeiro nome
      return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'N/A';
    
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'INCOMPLETE': return 'Incompleto';
      case 'DELIVERED': return 'Entregue';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    
    switch (status) {
      case 'PENDING': return 'statusPending';
      case 'INCOMPLETE': return 'statusIncomplete';
      case 'DELIVERED': return 'statusDelivered';
      case 'CANCELLED': return 'statusCancelled';
      default: return '';
    }
  }

  // ===== MÉTODOS DE CONTROLE DE BOTÕES =====

  podeCancelar(): boolean {
    return this.delivery?.status === 'PENDING' || this.delivery?.status === 'INCOMPLETE';
  }

  podeCompletar(): boolean {
    return this.delivery?.status === 'INCOMPLETE';
  }

  podeDesfazer(): boolean {
    return this.delivery?.status === 'DELIVERED';
  }

  podeRestaurar(): boolean {
    return this.delivery?.status === 'CANCELLED';
  }

  podeCriarTarefa(): boolean {
    return this.delivery?.status === 'PENDING' || this.delivery?.status === 'INCOMPLETE';
  }

  // ===== MÉTODOS DE ESTATÍSTICAS =====

  contarTarefasPorStatus(status: string): number {
    return this.tarefas.filter((tarefa: any) => tarefa.status === status).length;
  }

  getProgressoDelivery(): number {
    if (this.tarefas.length === 0) return 0;
    
    const tarefasConcluidas = this.tarefas.filter((tarefa: any) => 
      tarefa.status === 'DONE' || tarefa.status === 'DELIVERED'
    ).length;
    
    return Math.round((tarefasConcluidas / this.tarefas.length) * 100);
  }

  getTarefasPendentes(): any[] {
    return this.tarefas.filter((tarefa: any) => tarefa.status === 'PENDING');
  }

  getTarefasEmExecucao(): any[] {
    return this.tarefas.filter((tarefa: any) => tarefa.status === 'DOING');
  }

  getTarefasFinalizadas(): any[] {
    return this.tarefas.filter((tarefa: any) => tarefa.status === 'DONE');
  }

  getTarefasAprovadas(): any[] {
    return this.tarefas.filter((tarefa: any) => tarefa.status === 'DELIVERED');
  }

  // ===== MÉTODOS DE FORMATAÇÃO =====

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDateTime(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('pt-BR');
  }

  getTarefaStatusLabel(status: string | undefined, tarefa?: any): string {
    if (!status) return 'N/A';
    
    if (tarefa?.dismissed === true) {
      return 'Cancelada';
    }
    
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'DOING': return 'Em progresso';
      case 'DONE': 
        return tarefa?.approved === true ? 'Aprovado' : 'Aguardando Aprovação';
      case 'DELIVERED': return 'Entregue';
      case 'LOST': return 'Perdido';
      case 'CANCELLED': return 'Cancelado';
      case 'INCOMPLETE': return 'Incompleto';
      default: return status;
    }
  }

  getTarefaStatusClass(status: string | undefined, tarefa?: any): string {
    if (!status) return '';
    
    if (tarefa?.dismissed === true) {
      return 'statusCancelled';
    }
    
    switch (status) {
      case 'PENDING': return 'statusPending';
      case 'DOING': return 'statusDoing';
      case 'DONE': return 'statusDone';
      case 'DELIVERED': return 'statusDelivered';
      case 'LOST': return 'statusLost';
      case 'CANCELLED': return 'statusCancelled';
      case 'INCOMPLETE': return 'statusIncomplete';
      default: return '';
    }
  }
} 