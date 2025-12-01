import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uBotaoSelecaoComponent} from './c4u-botao-selecao.component';

describe('C4uBotaoSelecaoComponent', () => {
    let component: C4uBotaoSelecaoComponent;
    let fixture: ComponentFixture<C4uBotaoSelecaoComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uBotaoSelecaoComponent]
        });
        fixture = TestBed.createComponent(C4uBotaoSelecaoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
