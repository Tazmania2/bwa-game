import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uPainelVidroComponent} from './c4u-painel-vidro.component';

describe('C4uPainelVidroComponent', () => {
    let component: C4uPainelVidroComponent;
    let fixture: ComponentFixture<C4uPainelVidroComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uPainelVidroComponent]
        });
        fixture = TestBed.createComponent(C4uPainelVidroComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
