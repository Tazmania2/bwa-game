import { ComponentFixture, TestBed } from '@angular/core/testing';

import { C4uAnimacaoCidComponent } from './c4u-animacao-cid.component';

describe('C4uAnimacaoCidComponent', () => {
  let component: C4uAnimacaoCidComponent;
  let fixture: ComponentFixture<C4uAnimacaoCidComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [C4uAnimacaoCidComponent]
    });
    fixture = TestBed.createComponent(C4uAnimacaoCidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
