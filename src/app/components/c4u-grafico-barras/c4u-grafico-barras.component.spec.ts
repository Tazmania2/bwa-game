import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uGraficoBarrasComponent} from './c4u-grafico-barras.component';

describe('C4uGraficoBarrasComponent', () => {
    let component: C4uGraficoBarrasComponent;
    let fixture: ComponentFixture<C4uGraficoBarrasComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uGraficoBarrasComponent]
        });
        fixture = TestBed.createComponent(C4uGraficoBarrasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
