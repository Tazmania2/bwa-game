import { ComponentFixture, TestBed } from '@angular/core/testing';

import { C4uSeletorItemComponent } from './c4u-seletor-item.component';

describe('C4uSeletorTimeComponent', () => {
  let component: C4uSeletorItemComponent;
  let fixture: ComponentFixture<C4uSeletorItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [C4uSeletorItemComponent]
    });
    fixture = TestBed.createComponent(C4uSeletorItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
