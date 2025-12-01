import {Component, Input} from '@angular/core';

@Component({
  selector: 'c4u-painel-info',
  templateUrl: './c4u-painel-info.component.html',
  styleUrls: ['./c4u-painel-info.component.scss']
})
export class C4uPainelInfoComponent {
  @Input()
  title: string = '';

  @Input()
  isVerticalItem?: boolean = false;

  @Input()
  info: Array<PainelInfoModel> = [];

  doAction(item: PainelInfoModel) {
    if (item.action) {
      item.action();
    }
  }
}

export interface PainelInfoModel {
  value: number;
  text: string;
  icon: string;
  toolTip?: string;
  action?: () => void;
  extras?: any;
}
