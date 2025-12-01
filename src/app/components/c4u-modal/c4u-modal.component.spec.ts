import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uModalComponent} from './c4u-modal.component';

describe('C4uModalComponent', () => {
    let component: C4uModalComponent;
    let fixture: ComponentFixture<C4uModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uModalComponent]
        });
        fixture = TestBed.createComponent(C4uModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
