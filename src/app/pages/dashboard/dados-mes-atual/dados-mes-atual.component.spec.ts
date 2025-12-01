import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DadosMesAtualComponent } from './dados-mes-atual.component';

describe('DadosMesAtualColaboradorComponent', () => {
  let component: DadosMesAtualComponent;
  let fixture: ComponentFixture<DadosMesAtualComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DadosMesAtualComponent]
    });
    fixture = TestBed.createComponent(DadosMesAtualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
