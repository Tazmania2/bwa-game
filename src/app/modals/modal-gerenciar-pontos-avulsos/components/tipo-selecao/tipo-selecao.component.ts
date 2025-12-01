import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BotaoSelecaoItemModel } from '../../../../components/c4u-botao-selecao/c4u-botao-selecao.component';

@Component({
  selector: 'app-tipo-selecao',
  templateUrl: './tipo-selecao.component.html',
  styleUrls: ['./tipo-selecao.component.scss']
})
export class TipoSelecaoComponent {
  @Input() selectedType: number = 0;
  @Output() typeChange = new EventEmitter<number>();

  typeButtons: BotaoSelecaoItemModel[] = [
    { text: 'Processos', icon: 'icon-timeline' },
    { text: 'Tarefas', icon: 'icon-handyman' },
    { text: 'Criar', icon: 'icon-add', alignRight: true }
  ];

  onTypeChange(typeIndex: number) {
    this.typeChange.emit(typeIndex);
  }
} 