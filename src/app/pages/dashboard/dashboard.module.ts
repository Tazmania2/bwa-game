import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardColaboradorComponent } from './dashboard-colaborador/dashboard-colaborador.component';
import { SharedModule } from '../../shared.module';
import { SeasonModule } from './season/season.module';
import { C4uSeletorMesModule } from '../../components/c4u-seletor-mes/c4u-seletor-mes.module';
import { C4uCardModule } from '../../components/c4u-card/c4u-card.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { C4uMostradorProgressoModule } from '../../components/c4u-mostrador-progresso/c4u-mostrador-progresso.module';
import { C4uPainelInfoModule } from '../../components/c4u-painel-info/c4u-painel-info.module';
import { C4uGraficoLinhasModule } from '../../components/c4u-grafico-linhas/c4u-grafico-linhas.module';
import { FormsModule } from '@angular/forms';
import { C4uBotaoSelecaoModule } from '../../components/c4u-botao-selecao/c4u-botao-selecao.module';
import { C4uGraficoBarrasModule } from '../../components/c4u-grafico-barras/c4u-grafico-barras.module';

import { C4uTabbarModule } from '../../components/c4u-tabbar/c4u-tabbar.module';
import { DashboardGestorComponent } from './dashboard-gestor/dashboard-gestor.component';
import { C4uPorcentagemCircularModule } from '../../components/c4u-porcentagem-circular/c4u-porcentagem-circular.module';
import { DadosMetasProgressoTimeComponent } from './dados-metas-progresso-time/dados-metas-progresso-time.component';
import { DadosProdutividadeTimeComponent } from './dados-produtividade-time/dados-produtividade-time.component';
import { C4uSeletorItemModule } from '../../components/c4u-seletor-item/c4u-seletor-item.module';
import { DadosMesAnteriorComponent } from './dados-mes-anterior/dados-mes-anterior.component';
import { DadosMesAtualComponent } from './dados-mes-atual/dados-mes-atual.component';
import { C4uTypeaheadModule } from '../../components/c4u-typeahead/c4u-typeahead.module';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardColaboradorComponent,
    DadosMesAnteriorComponent,
    DadosMesAtualComponent,
    DashboardGestorComponent,
    DadosMetasProgressoTimeComponent,
    DadosProdutividadeTimeComponent,
  ],
  exports: [DashboardComponent],
  imports: [
    SharedModule,
    SeasonModule,
    C4uSeletorMesModule,
    C4uCardModule,
    NgSelectModule,
    C4uMostradorProgressoModule,
    C4uPainelInfoModule,
    C4uGraficoLinhasModule,
    FormsModule,
    C4uBotaoSelecaoModule,
    C4uGraficoBarrasModule,
    C4uTabbarModule,
    C4uPorcentagemCircularModule,
    C4uSeletorItemModule,
    C4uTypeaheadModule,
  ],
})
export class DashboardModule {}
