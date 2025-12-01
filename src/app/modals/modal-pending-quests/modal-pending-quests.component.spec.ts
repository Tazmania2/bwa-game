import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModalPendingQuestsComponent} from './modal-pending-quests.component';

describe('ModalPendingQuestsComponent', () => {
    let component: ModalPendingQuestsComponent;
    let fixture: ComponentFixture<ModalPendingQuestsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ModalPendingQuestsComponent]
        });
        fixture = TestBed.createComponent(ModalPendingQuestsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
