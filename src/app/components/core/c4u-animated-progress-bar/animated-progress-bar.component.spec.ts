import { ComponentFixture, TestBed } from '@angular/core/testing';

import { animatedProgressBarComponent } from './animated-progress-bar.component';

describe('C4uAnimatedProgressBarComponent', () => {
  let component: animatedProgressBarComponent;
  let fixture: ComponentFixture<animatedProgressBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [animatedProgressBarComponent],
    });
    fixture = TestBed.createComponent(animatedProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
