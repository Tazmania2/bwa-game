import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreveComponent } from './breve.component';

describe('BreveComponent', () => {
  let component: BreveComponent;
  let fixture: ComponentFixture<BreveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BreveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
