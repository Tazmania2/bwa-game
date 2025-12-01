import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetalheExecutorComponent } from './modal-detalhe-executor.component';

describe('ModalDetalheExecutorComponent', () => {
  let component: ModalDetalheExecutorComponent;
  let fixture: ComponentFixture<ModalDetalheExecutorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalDetalheExecutorComponent]
    });
    fixture = TestBed.createComponent(ModalDetalheExecutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
