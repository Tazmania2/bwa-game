import {ComponentFixture, TestBed} from '@angular/core/testing';

import {C4uAccordionItemComponent} from './c4u-accordion-item.component';

describe('C4uAccordionItemComponent', () => {
  let component: C4uAccordionItemComponent;
  let fixture: ComponentFixture<C4uAccordionItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [C4uAccordionItemComponent]
    });
    fixture = TestBed.createComponent(C4uAccordionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
