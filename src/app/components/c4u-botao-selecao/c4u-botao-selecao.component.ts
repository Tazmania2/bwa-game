import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'c4u-botao-selecao',
    templateUrl: './c4u-botao-selecao.component.html',
    styleUrls: ['./c4u-botao-selecao.component.scss']
})
export class C4uBotaoSelecaoComponent {
    @Input()
    items: Array<BotaoSelecaoItemModel> | undefined = [];

    @Input()
    selection: number | undefined = 0;

    @Output()
    selectionChange = new EventEmitter<number>();

    enable(i: number) {
        if (this.selection != i) {
            this.selection = i;
            this.selectionChange.emit(i);
        }
    }

    trackByIndex(index: number): number {
        return index;
    }
}

export interface BotaoSelecaoItemModel {
    text: string;
    icon?: string;
    alignRight?: boolean; // Nova propriedade para alinhar à direita
}
