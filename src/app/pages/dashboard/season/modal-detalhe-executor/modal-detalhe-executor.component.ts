import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ExecutorExtrato} from "../../../../model/detalhe-extrato-colaborador.model";
import {TemporadaService} from "../../../../services/temporada.service";

export const CONVERSAO_PONTOS_MOEDAS = 10;

@Component({
  selector: 'app-modal-detalhe-executor',
  templateUrl: './modal-detalhe-executor.component.html',
  styleUrls: ['./modal-detalhe-executor.component.scss']
})
export class ModalDetalheExecutorComponent implements AfterViewInit {

  idConsulta: number | undefined;
  data: ExecutorExtrato | undefined;
  cotacao: number | undefined;

  constructor(private modal: NgbActiveModal,
              private temporadaService: TemporadaService) {
  }

  ngAfterViewInit() {
    this.getDadosExtrato();
  }

  cancel() {
    this.modal.dismiss();
  }

  getValor(moedas: number) {
    if (this.cotacao) {
      return Number(moedas) * Number(this.cotacao);
    }
    return 0;
  }

  getPontos(moedas: number) {
    return Math.floor(moedas * CONVERSAO_PONTOS_MOEDAS);
  }

  getDadosExtrato() {
    if (this.idConsulta) {
      // this.temporadaService.getDetalheExtratoColaborador(this.idConsulta).then(extrato => {
      //   if (extrato && extrato.executores.length > 0) {
      //     this.data = extrato.executores[0];
      //     this.cotacao = extrato.cotacao.cotacao;
      //     this.data?.atividades.sort((a, b) => b.moedas - a.moedas);
      //   } else {
      //     this.cancel();
      //   }
      // })
    } else {
      this.cancel();
    }

  }
}
