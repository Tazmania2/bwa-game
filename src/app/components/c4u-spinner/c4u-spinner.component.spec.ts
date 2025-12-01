import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uSpinnerComponent} from './c4u-spinner.component';

describe('C4uSpinnerComponent', () => {
    let component: C4uSpinnerComponent;
    let fixture: ComponentFixture<C4uSpinnerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uSpinnerComponent]
        });
        fixture = TestBed.createComponent(C4uSpinnerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
