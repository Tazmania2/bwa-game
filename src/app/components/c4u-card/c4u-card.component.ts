import {Component, Input} from '@angular/core';

@Component({
    selector: 'c4u-card',
    templateUrl: './c4u-card.component.html',
    styleUrls: ['./c4u-card.component.scss']
})
export class C4uCardComponent {

    @Input()
    titulo: string = '';

    @Input()
    fog: boolean = false;
}
