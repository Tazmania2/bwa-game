import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uAccordionComponent} from './c4u-accordion.component';

describe('C4uAccordionComponent', () => {
    let component: C4uAccordionComponent;
    let fixture: ComponentFixture<C4uAccordionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uAccordionComponent]
        });
        fixture = TestBed.createComponent(C4uAccordionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
