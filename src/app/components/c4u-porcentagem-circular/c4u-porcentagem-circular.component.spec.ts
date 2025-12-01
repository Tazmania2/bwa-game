import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uPorcentagemCircularComponent} from './c4u-porcentagem-circular.component';

describe('C4uPorcentagemCircularComponent', () => {
    let component: C4uPorcentagemCircularComponent;
    let fixture: ComponentFixture<C4uPorcentagemCircularComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uPorcentagemCircularComponent]
        });
        fixture = TestBed.createComponent(C4uPorcentagemCircularComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
