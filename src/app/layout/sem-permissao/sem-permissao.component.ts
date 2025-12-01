import {Component} from '@angular/core';

@Component({
  selector: 'app-sem-permissao',
  templateUrl: './sem-permissao.component.html',
  styleUrls: ['./sem-permissao.component.scss']
})
export class SemPermissaoComponent {

  constructor() {
  }

  tentaNovamente() {
    location.href = '/';
  }
}
