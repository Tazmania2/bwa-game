import { Component, Input, Output, EventEmitter } from '@angular/core';

export type AbaType = 'atribuir' | 'pendentes' | 'finalizados' | 'aprovados' | 'cancelados' | 'incompletos' | 'entregues' | 'processos-pendentes' | 'processos-cancelados';

@Component({
  selector: 'app-aba-navegacao',
  templateUrl: './aba-navegacao.component.html',
  styleUrls: ['./aba-navegacao.component.scss']
})
export class AbaNavegacaoComponent {
  @Input() selectedType: number = 0;
  @Input() currentAba: AbaType = 'processos-pendentes';
  @Output() abaChange = new EventEmitter<AbaType>();

  // Abas disponíveis por tipo
  get availableTabs(): Array<{id: AbaType, label: string, icon: string}> {
    switch (this.selectedType) {
      case 0: // Processos
        return [
          { id: 'processos-pendentes', label: 'Pendentes', icon: 'icon-notifications_paused' },
          { id: 'incompletos', label: 'Incompletos', icon: 'icon-rule' },
          { id: 'entregues', label: 'Entregues', icon: 'icon-new_releases' },
          { id: 'processos-cancelados', label: 'Cancelados', icon: 'icon-stop' }
        ];
      case 1: // Tarefas
        return [
          { id: 'pendentes', label: 'Pendentes', icon: 'icon-notifications_paused' },
          { id: 'finalizados', label: 'Aguardando Aprovação', icon: 'icon-rule' },
          { id: 'aprovados', label: 'Aprovados', icon: 'icon-new_releases' },
          { id: 'cancelados', label: 'Cancelados', icon: 'icon-stop' }
        ];
      default:
        return [];
    }
  }

  onAbaClick(aba: AbaType) {
    this.abaChange.emit(aba);
  }

  isActive(aba: AbaType): boolean {
    return this.currentAba === aba;
  }
} 