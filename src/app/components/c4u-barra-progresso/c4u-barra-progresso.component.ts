import {Component, Input} from '@angular/core';

@Component({
  selector: 'c4u-barra-progresso',
  templateUrl: './c4u-barra-progresso.component.html',
  styleUrls: ['./c4u-barra-progresso.component.scss']
})
export class C4uBarraProgressoComponent {
  _percent: number = 0;
  @Input()
  set percent(val: number) {
    setTimeout(() => this._percent = val)
  }

  get percent() {
    return this._percent;
  }

  @Input()
  theme: 'red' | 'gold' | 'green' = 'red';
}
