import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uMostradorProgressoComponent} from './c4u-mostrador-progresso.component';

describe('C4uBarraNivelComponent', () => {
    let component: C4uMostradorProgressoComponent;
    let fixture: ComponentFixture<C4uMostradorProgressoComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uMostradorProgressoComponent]
        });
        fixture = TestBed.createComponent(C4uMostradorProgressoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
