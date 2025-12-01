import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uGraficoLinhasComponent} from './c4u-grafico-linhas.component';

describe('C4uGraficoBarrasComponent', () => {
    let component: C4uGraficoLinhasComponent;
    let fixture: ComponentFixture<C4uGraficoLinhasComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uGraficoLinhasComponent]
        });
        fixture = TestBed.createComponent(C4uGraficoLinhasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
