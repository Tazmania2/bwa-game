import { ComponentFixture, TestBed } from '@angular/core/testing';

import { C4uCheckboxComponent } from './c4u-checkbox.component';

describe('C4uCheckboxComponent', () => {
  let component: C4uCheckboxComponent;
  let fixture: ComponentFixture<C4uCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ C4uCheckboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(C4uCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

