import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'c4u-tabbar',
    templateUrl: './c4u-tabbar.component.html',
    styleUrls: ['./c4u-tabbar.component.scss']
})
export class C4uTabbarComponent {
    @Input()
    items: Array<TabBarItemModel> | undefined = [];

    @Input()
    selected: number | undefined = 0;

    @Output()
    selectedChange = new EventEmitter<number>();

    select(i: number) {
        if (i != this.selected) {
            this.selected = i;
            this.selectedChange.emit(i);
        }
    }
}

export interface TabBarItemModel {
    name: string;
    icon?: string;
}
