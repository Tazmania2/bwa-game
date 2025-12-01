import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DadosMesAnteriorComponent } from './dados-mes-anterior.component';

describe('DadosMesAnteriorColaboradorComponent', () => {
  let component: DadosMesAnteriorComponent;
  let fixture: ComponentFixture<DadosMesAnteriorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DadosMesAnteriorComponent]
    });
    fixture = TestBed.createComponent(DadosMesAnteriorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
