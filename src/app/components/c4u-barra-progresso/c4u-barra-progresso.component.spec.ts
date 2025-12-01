import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uBarraProgressoComponent} from './c4u-barra-progresso.component';

describe('C4uBarraProgressoComponent', () => {
    let component: C4uBarraProgressoComponent;
    let fixture: ComponentFixture<C4uBarraProgressoComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uBarraProgressoComponent]
        });
        fixture = TestBed.createComponent(C4uBarraProgressoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
