import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressMarkComponent } from './progress-mark.component';

describe('ProgressMarkComponent', () => {
  let component: ProgressMarkComponent;
  let fixture: ComponentFixture<ProgressMarkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressMarkComponent]
    });
    fixture = TestBed.createComponent(ProgressMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
