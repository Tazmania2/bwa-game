import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DadosMetasProgressoTimeComponent } from './dados-metas-progresso-time.component';

describe('MetasProgressoTimeComponent', () => {
  let component: DadosMetasProgressoTimeComponent;
  let fixture: ComponentFixture<DadosMetasProgressoTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DadosMetasProgressoTimeComponent]
    });
    fixture = TestBed.createComponent(DadosMetasProgressoTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
