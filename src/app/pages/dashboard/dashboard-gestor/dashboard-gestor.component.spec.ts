import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGestorComponent } from './dashboard-gestor.component';

describe('DashboardGestorComponent', () => {
  let component: DashboardGestorComponent;
  let fixture: ComponentFixture<DashboardGestorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardGestorComponent]
    });
    fixture = TestBed.createComponent(DashboardGestorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
