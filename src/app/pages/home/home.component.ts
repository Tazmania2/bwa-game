import {Component} from '@angular/core';
import {SessaoProvider} from "../../providers/sessao/sessao.provider";

@Component({
    selector: 'page-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(private sessao: SessaoProvider) {
  }

  get sessaoReady() {
    return this.sessao.usuario;
  }
}
