import {Component, Input} from '@angular/core';
import {TabBarItemModel} from "../../../components/c4u-tabbar/c4u-tabbar.component";
import {translate} from "../../../providers/translate.provider";

@Component({
  selector: 'app-dashboard-gestor',
  templateUrl: './dashboard-gestor.component.html',
  styleUrls: ['./dashboard-gestor.component.scss']
})
export class DashboardGestorComponent {
  @Input()
  idTime: number | any;

  @Input()
  nomeTime: number | any;

  @Input()
  mesAnterior: number = 0;

  @Input()
  isCSLayout: boolean = false;
  
  selectedTab: number = 0;

  tabItens: Array<TabBarItemModel> = [{
    name: translate('LABEL_GOALS_PROGRESS'),
  }, {
    name: translate('LABEL_PRODUCTIVITY_ANALYSIS'),
  }];

}
