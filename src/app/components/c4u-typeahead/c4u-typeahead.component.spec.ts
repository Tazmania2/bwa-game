import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uTypeaheadComponent} from './c4u-typeahead.component';

describe('C4uTypeaheadComponent', () => {
    let component: C4uTypeaheadComponent;
    let fixture: ComponentFixture<C4uTypeaheadComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uTypeaheadComponent]
        });
        fixture = TestBed.createComponent(C4uTypeaheadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
