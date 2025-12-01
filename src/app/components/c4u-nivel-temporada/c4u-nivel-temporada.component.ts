import {Component, Input} from '@angular/core';

@Component({
    selector: 'c4u-mostrador-nivel-temporada',
    templateUrl: './c4u-nivel-temporada.component.html',
    styleUrls: ['./c4u-nivel-temporada.component.scss']
})
export class C4uNivelTemporadaComponent {
    @Input()
    level: number = 0;

    @Input()
    iconify: boolean = false;
}
