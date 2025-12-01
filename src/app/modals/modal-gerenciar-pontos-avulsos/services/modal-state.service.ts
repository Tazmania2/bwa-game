import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AbaType } from '../components/aba-navegacao/aba-navegacao.component';

export interface ModalState {
  selectedType: number;
  currentAba: AbaType;
  mostrarDetalhe: boolean;
  mostrarDetalheDelivery: boolean;
  atividadeSelecionada: any;
  deliverySelecionada: any;
  retornarParaDelivery: boolean;
  deliveryParaRetornar: any;
  abaAnterior: AbaType | null;
}

@Injectable({
  providedIn: 'root'
})
export class ModalStateService {
  private stateSubject = new BehaviorSubject<ModalState>({
    selectedType: 0,
    currentAba: 'processos-pendentes',
    mostrarDetalhe: false,
    mostrarDetalheDelivery: false,
    atividadeSelecionada: null,
    deliverySelecionada: null,
    retornarParaDelivery: false,
    deliveryParaRetornar: null,
    abaAnterior: null
  });

  state$: Observable<ModalState> = this.stateSubject.asObservable();

  get currentState(): ModalState {
    return this.stateSubject.value;
  }

  updateState(updates: Partial<ModalState>) {
    this.stateSubject.next({
      ...this.currentState,
      ...updates
    });
  }

  setSelectedType(type: number) {
    this.updateState({ selectedType: type });
  }

  setCurrentAba(aba: AbaType) {
    this.updateState({ currentAba: aba });
  }

  abrirDetalheAtividade(atividade: any, abaAnterior: AbaType) {
    this.updateState({
      mostrarDetalhe: true,
      atividadeSelecionada: atividade,
      abaAnterior
    });
  }

  fecharDetalheAtividade() {
    this.updateState({
      mostrarDetalhe: false,
      atividadeSelecionada: null,
      abaAnterior: null
    });
  }

  abrirDetalheDelivery(delivery: any, abaAnterior: AbaType) {
    this.updateState({
      mostrarDetalheDelivery: true,
      deliverySelecionada: delivery,
      abaAnterior
    });
  }

  fecharDetalheDelivery() {
    this.updateState({
      mostrarDetalheDelivery: false,
      deliverySelecionada: null,
      abaAnterior: null
    });
  }

  setRetornoDelivery(delivery: any, abaAnterior: AbaType) {
    this.updateState({
      retornarParaDelivery: true,
      deliveryParaRetornar: delivery,
      abaAnterior
    });
  }

  limparRetornoDelivery() {
    this.updateState({
      retornarParaDelivery: false,
      deliveryParaRetornar: null,
      abaAnterior: null
    });
  }

  resetState() {
    this.stateSubject.next({
      selectedType: 0,
      currentAba: 'processos-pendentes',
      mostrarDetalhe: false,
      mostrarDetalheDelivery: false,
      atividadeSelecionada: null,
      deliverySelecionada: null,
      retornarParaDelivery: false,
      deliveryParaRetornar: null,
      abaAnterior: null
    });
  }
} 