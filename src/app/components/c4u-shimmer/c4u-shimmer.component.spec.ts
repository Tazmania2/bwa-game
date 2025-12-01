import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uShimmerComponent} from './c4u-shimmer.component';

describe('C4uShimmerComponent', () => {
    let component: C4uShimmerComponent;
    let fixture: ComponentFixture<C4uShimmerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uShimmerComponent]
        });
        fixture = TestBed.createComponent(C4uShimmerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
