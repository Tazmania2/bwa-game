import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MainComponent} from './main.component';
import {SeasonNewsModalService} from '@services/season-news-modal.service';

describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MainComponent],
            providers: [
                {
                    provide: SeasonNewsModalService,
                    useValue: { tryShowAfterLogin: () => undefined },
                },
            ],
        });
        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
