import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uCardComponent} from './c4u-card.component';

describe('C4uCardComponent', () => {
    let component: C4uCardComponent;
    let fixture: ComponentFixture<C4uCardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uCardComponent]
        });
        fixture = TestBed.createComponent(C4uCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
