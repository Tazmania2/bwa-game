import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uPainelInfoComponent} from './c4u-painel-info.component';

describe('C4uPainelInfoComponent', () => {
    let component: C4uPainelInfoComponent;
    let fixture: ComponentFixture<C4uPainelInfoComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uPainelInfoComponent]
        });
        fixture = TestBed.createComponent(C4uPainelInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
