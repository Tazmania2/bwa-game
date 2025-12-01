import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uTabbarComponent} from './c4u-tabbar.component';

describe('C4uTabbarComponent', () => {
    let component: C4uTabbarComponent;
    let fixture: ComponentFixture<C4uTabbarComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uTabbarComponent]
        });
        fixture = TestBed.createComponent(C4uTabbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
