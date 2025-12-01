import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'c4u-seletor-item',
    templateUrl: './c4u-seletor-item.component.html',
    styleUrls: ['./c4u-seletor-item.component.scss']
})
export class C4uSeletorItemComponent {
  @Output()
  onSelected = new EventEmitter();

  @Output()
  onSearched = new EventEmitter();

  @Input()
  label: string = "Selecione"

  @Input()
  items: Array<any> = [];

  @Input()
  searcheable = true;

  @Input()
  clearValue = false;

  @Input()
  bindLabel: string = 'nome';

  @Input()
  selected: number | any;

  onChange() {
    this.onSelected.emit(this.selected);
  }

  onSearch(event: any) {
    this.onSearched.emit(event.term);
  }
}
