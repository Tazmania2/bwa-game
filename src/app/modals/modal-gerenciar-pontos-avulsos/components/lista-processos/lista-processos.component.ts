import { Component, Input, Output, EventEmitter } from '@angular/core';

export type TipoListaProcessos = 'processos-pendentes' | 'incompletos' | 'entregues' | 'processos-cancelados';

@Component({
  selector: 'app-lista-processos',
  templateUrl: './lista-processos.component.html',
  styleUrls: ['./lista-processos.component.scss']
})
export class ListaProcessosComponent {
  @Input() tipo: TipoListaProcessos = 'processos-pendentes';
  @Input() processos: any[] = [];
  @Input() loading = false;
  @Input() aliases: any;
  @Output() processoClick = new EventEmitter<any>();
  @Output() criarTarefa = new EventEmitter<any>();

  // Configurações específicas por tipo
  get configuracao() {
    switch (this.tipo) {
      case 'processos-pendentes':
        return {
          titulo: `${this.aliases?.deliveryAlias}s Pendentes`,
          subtitulo: `Processos que ainda não foram iniciados ou estão aguardando execução.`,
          corBorda: '#ef4444',
          iconeVazio: 'icon-notifications_paused',
          mensagemVazio: `Nenhum ${this.aliases?.deliveryAlias} pendente encontrado`,
          subtituloVazio: `Os ${this.aliases?.deliveryAlias}s pendentes aparecerão aqui`
        };
      case 'incompletos':
        return {
          titulo: `${this.aliases?.deliveryAlias}s Incompletos`,
          subtitulo: `Processos que foram iniciados mas ainda não foram finalizados.`,
          corBorda: '#f59e0b',
          iconeVazio: 'icon-rule',
          mensagemVazio: `Nenhum ${this.aliases?.deliveryAlias} incompleto encontrado`,
          subtituloVazio: `Os ${this.aliases?.deliveryAlias}s incompletos aparecerão aqui`
        };
      case 'entregues':
        return {
          titulo: `${this.aliases?.deliveryAlias}s Entregues`,
          subtitulo: `Processos que foram completados e entregues com sucesso.`,
          corBorda: '#10b981',
          iconeVazio: 'icon-check_circle',
          mensagemVazio: `Nenhum ${this.aliases?.deliveryAlias} entregue encontrado`,
          subtituloVazio: `Os ${this.aliases?.deliveryAlias}s entregues aparecerão aqui`
        };
      case 'processos-cancelados':
        return {
          titulo: `${this.aliases?.deliveryAlias}s Cancelados`,
          subtitulo: `Processos que foram cancelados por algum motivo.`,
          corBorda: '#6b7280',
          iconeVazio: 'icon-cancel',
          mensagemVazio: `Nenhum ${this.aliases?.deliveryAlias} cancelado encontrado`,
          subtituloVazio: `Os ${this.aliases?.deliveryAlias}s cancelados aparecerão aqui`
        };
      default:
        return {
          titulo: 'Processos',
          subtitulo: 'Lista de processos',
          corBorda: '#6b7280',
          iconeVazio: 'icon-info',
          mensagemVazio: 'Nenhum processo encontrado',
          subtituloVazio: 'Os processos aparecerão aqui'
        };
    }
  }

  onProcessoClick(processo: any) {
    this.processoClick.emit(processo);
  }

  onCriarTarefa(processo: any, event: Event) {
    event.stopPropagation();
    this.criarTarefa.emit(processo);
  }

  // Método para formatar email para nome
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

  // Método para obter o status traduzido
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

  // Método para obter a classe CSS do status
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

  // Método para contar tarefas por status
  contarTarefasPorStatus(processo: any, status: string): number {
    if (!processo.user_action || !Array.isArray(processo.user_action)) {
      return 0;
    }
    
    return processo.user_action.filter((tarefa: any) => tarefa.status === status).length;
  }

  // Método para obter o progresso do processo
  getProgressoProcesso(processo: any): number {
    if (!processo.user_action || !Array.isArray(processo.user_action)) {
      return 0;
    }
    
    const totalTarefas = processo.user_action.length;
    if (totalTarefas === 0) return 0;
    
    const tarefasConcluidas = processo.user_action.filter((tarefa: any) => 
      tarefa.status === 'DONE' || tarefa.status === 'DELIVERED'
    ).length;
    
    return Math.round((tarefasConcluidas / totalTarefas) * 100);
  }

  // Método para verificar se pode criar tarefa
  podeCriarTarefa(processo: any): boolean {
    return processo.status === 'PENDING' || processo.status === 'INCOMPLETE';
  }
} 