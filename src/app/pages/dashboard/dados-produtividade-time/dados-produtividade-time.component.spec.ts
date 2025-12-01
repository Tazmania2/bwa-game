import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DadosProdutividadeTimeComponent } from './dados-produtividade-time.component';

describe('ProdutividadeTimeComponent', () => {
  let component: DadosProdutividadeTimeComponent;
  let fixture: ComponentFixture<DadosProdutividadeTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DadosProdutividadeTimeComponent]
    });
    fixture = TestBed.createComponent(DadosProdutividadeTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
