import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AtividadeDetalhe } from '../../../../services/pontos-avulsos.service';

export type TipoListaAtividades = 'pendentes' | 'finalizadas' | 'aprovadas' | 'canceladas';

@Component({
  selector: 'app-lista-atividades',
  templateUrl: './lista-atividades.component.html',
  styleUrls: ['./lista-atividades.component.scss']
})
export class ListaAtividadesComponent {
  @Input() tipo: TipoListaAtividades = 'pendentes';
  @Input() atividades: AtividadeDetalhe[] = [];
  @Input() loading = false;
  @Input() aliases: any;
  @Output() atividadeClick = new EventEmitter<AtividadeDetalhe>();

  // Configurações específicas por tipo
  get configuracao() {
    switch (this.tipo) {
      case 'pendentes':
        return {
          titulo: `${this.aliases?.actionAlias}s Pendentes e em Execução`,
          subtitulo: `Veja aqui todas as tarefas que ainda não foram finalizadas ou estão em andamento nesta temporada.`,
          corBorda: '#ef4444',
          iconeVazio: 'icon-check_circle',
          mensagemVazio: `Nenhuma ${this.aliases?.actionAlias} pendente encontrada`,
          subtituloVazio: `As ${this.aliases?.actionAlias}s pendentes e em execução aparecerão aqui`
        };
      case 'finalizadas':
        return {
          titulo: `${this.aliases?.actionAlias}s finalizados(as) aguardando aprovação`,
          subtitulo: `Estas tarefas já foram concluídas, mas aguardam aprovação para que os pontos sejam liberados.`,
          corBorda: '#10b981',
          iconeVazio: 'icon-check_circle',
          mensagemVazio: `Não há ${this.aliases?.actionAlias}s finalizados(as) aguardando aprovação`,
          subtituloVazio: `As ${this.aliases?.actionAlias}s finalizados(as) aguardando aprovação aparecerão aqui`
        };
      case 'aprovadas':
        return {
          titulo: `${this.aliases?.actionAlias}s Aprovadas`,
          subtitulo: `Tarefas que foram aprovadas e os pontos foram liberados.`,
          corBorda: '#3b82f6',
          iconeVazio: 'icon-check_circle',
          mensagemVazio: `Nenhuma ${this.aliases?.actionAlias} aprovada encontrada`,
          subtituloVazio: `As ${this.aliases?.actionAlias}s aprovadas aparecerão aqui`
        };
      case 'canceladas':
        return {
          titulo: `${this.aliases?.actionAlias}s Canceladas`,
          subtitulo: `Tarefas que foram canceladas por algum motivo.`,
          corBorda: '#6b7280',
          iconeVazio: 'icon-cancel',
          mensagemVazio: `Nenhuma ${this.aliases?.actionAlias} cancelada encontrada`,
          subtituloVazio: `As ${this.aliases?.actionAlias}s canceladas aparecerão aqui`
        };
      default:
        return {
          titulo: 'Atividades',
          subtitulo: 'Lista de atividades',
          corBorda: '#6b7280',
          iconeVazio: 'icon-info',
          mensagemVazio: 'Nenhuma atividade encontrada',
          subtituloVazio: 'As atividades aparecerão aqui'
        };
    }
  }

  onAtividadeClick(atividade: AtividadeDetalhe) {
    this.atividadeClick.emit(atividade);
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
  getStatusLabel(status: string | undefined, atividade?: any): string {
    if (!status) return 'N/A';
    
    // Se a atividade está dismissed, mostrar como cancelada
    if (atividade?.dismissed === true) {
      return 'Cancelada';
    }
    
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'DOING': return 'Em progresso';
      case 'DONE': 
        if (atividade) {
          return atividade.approved === true ? 'Aprovado' : 'Aguardando Aprovação';
        }
        return 'Aguardando Aprovação';
      case 'DELIVERED': return 'Entregue';
      case 'LOST': return 'Perdido';
      case 'CANCELLED': return 'Cancelado';
      case 'INCOMPLETE': return 'Incompleto';
      default: return status;
    }
  }

  // Método para obter a classe CSS do status
  getStatusClass(status: string | undefined, atividade?: any): string {
    if (!status) return '';
    
    // Se a atividade está dismissed, aplicar classe de cancelado
    if (atividade?.dismissed === true) {
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