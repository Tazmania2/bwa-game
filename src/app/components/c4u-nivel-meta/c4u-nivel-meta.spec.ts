import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uNivelMeta} from './c4u-nivel-meta';

describe('NivelMetaComponent', () => {
    let component: C4uNivelMeta;
    let fixture: ComponentFixture<C4uNivelMeta>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [C4uNivelMeta]
        });
        fixture = TestBed.createComponent(C4uNivelMeta);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
