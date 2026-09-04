import { Component, OnInit } from '@angular/core';
import { SessaoProvider } from '@providers/sessao/sessao.provider';

@Component({
  standalone: true,
  templateUrl: './servico-indisponivel.component.html',
  styleUrls: ['./servico-indisponivel.component.scss'],
})
export class ServicoIndisponivelComponent implements OnInit {
  constructor(private sessao: SessaoProvider) {}

  ngOnInit(): void {
    if (this.sessao.usuario || this.sessao.token) {
      void this.sessao.logout(false);
    }
  }
}
