import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uNivelTemporadaComponent} from './c4u-nivel-temporada.component';

describe('C4uMostradorNivelComponent', () => {
    let component: C4uNivelTemporadaComponent;
    let fixture: ComponentFixture<C4uNivelTemporadaComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uNivelTemporadaComponent]
        });
        fixture = TestBed.createComponent(C4uNivelTemporadaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
