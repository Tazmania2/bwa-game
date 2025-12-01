import {Component, Input, OnChanges} from '@angular/core';
import {GraficoService} from "../../../services/grafico.service";
import {translate} from "../../../providers/translate.provider";
import {BotaoSelecaoItemModel} from "../../../components/c4u-botao-selecao/c4u-botao-selecao.component";
import {MesAtualService} from "../../../services/mes-atual.service";
import {ResumoMes} from "../../../model/resumoMes.model";
import {TIPO_CONSULTA_COLABORADOR} from "../dashboard.component";
import {MesAnteriorService} from "../../../services/mes-anterior.service";
import {getLevelPercent} from '@utils/getLevelPercent';
import { AliasService, SystemAliases } from 'src/app/services/alias.service';
import { GoalsConfig, GoalsConfigService } from 'src/app/services/goals-config.service';
import { FeaturesService, SystemFeatures } from 'src/app/services/features.service';
import { TeamStatsCacheService } from 'src/app/services/team-stats-cache.service';


const NIVEL_POR_ESTRELA = 1;

@Component({
  selector: 'dashboard-colaborador',
  templateUrl: './dashboard-colaborador.component.html',
  styleUrls: ['./dashboard-colaborador.component.scss']
})
export class DashboardColaboradorComponent implements OnChanges {
  constructor(
    private graficoService: GraficoService,
    private mesAtualService: MesAtualService,
    private mesAnteriorService: MesAnteriorService,
    private aliasService: AliasService,
    private goalsConfigService: GoalsConfigService,
    private featuresService: FeaturesService,
    private teamStatsCacheService: TeamStatsCacheService
  ) {
  }

  @Input()
  idUsuario: number | any;

  @Input()
  mesAnterior: number = 0;

  @Input()
  apiReady: boolean = false;

  goalsConfig: GoalsConfig | null = null;
  maxLevel: number = 0;
  features: SystemFeatures | null = null;
  aliases: SystemAliases | null = null;

  statusJogador: {
    label: string;
    value: number;
    icon: string;
  } | null = null;

  statusJogadorOptions = [
    {
      label: 'Status de produção: Aquecendo motores',
      value: 1,
      icon: 'icon-alarm_exclanation'
      // icon: 'icon-fire'
    },
    {
      label: 'Status de produção: Explorador em ação',
      value: 2,
      icon: 'icon-user_check'
      // icon: 'icon-binoculars'
    },
    {
      label: 'Status de produção: Modo turbo ativado',
      value: 3,
      icon: 'icon-auto_awesome'
      // icon: 'icon-rocket'
    },
    {
      label: 'Status de produção: Meta alcançada - Campeão',
      value: 4,
      icon: 'icon-new_releases'
      // icon: 'icon-trophy'
    },
    {
      label: 'Status de produção: Lenda Viva - Ao infinito e além',
      value: 5,
      icon: 'icon-hand-stars'
      // icon: 'icon-star-full'
    },
  ];

  dadosMes: ResumoMes | any;
  nivelMeta: {
    nivel: any,
    estrelas: number,
    tema: 'red' | 'green' | 'gold'
  } | any;

  values = [{valueList: [0], label: translate('LABEL_QUESTS')}];
  labels = [''];
  dateRanges = [
    {val: 60, text: `60 ${translate('LABEL_DAYS')}`},
    {val: 30, text: `30 ${translate('LABEL_DAYS')}`},
    {val: 15, text: `15 ${translate('LABEL_DAYS')}`},
    {val: 7, text: `7 ${translate('LABEL_DAYS')}`},
  ];
  selectedDateRange = 7;
  itemsButton: Array<BotaoSelecaoItemModel> = [{
    icon: 'icon-timeline',
    text: translate('LABEL_LINE')
  }, {
    icon: 'icon-bar_chart',
    text: translate('LABEL_BARS')
  }];
  chartSelection = 0;
  chartLoaded: any;

  init(): void {
    this.dadosMes = null;
    this.chartLoaded = false;
    this.nivelMeta = null;
    if (this.idUsuario) {
      // this.getDadosGrafico();
      if (this.mesAnterior) {
        this.getDadosMesAnterior();
      } else {
        this.getDadosMesAtual();
      }
    }
  }

  getDadosGrafico() {
    if (this.idUsuario) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - this.selectedDateRange);

      this.graficoService.getDadosGrafico(
        this.idUsuario,
        this.tipoConsulta,
        startDate.toISOString(),
        endDate.toISOString()
        // this.mesAnterior,
        // this.selectedDays
      ).then(
        (graphicData) => {
          const grafico = graphicData as any;
          // this.valuesAtividades = [{
          //   valueList: grafico.stats.map(({total_actions}: any) => total_actions),
          //   label: this.nomeTime + ' (100%)'
        // data => {

        // this.values[0].valueList = data.datas.map(({qtdeAtividades}) => qtdeAtividades);
        // this.labels = data.datas.map(({data}) => data);

        // this.chartLoaded = 'yes';
      });
    }
  }

  getDadosMesAtual() {
    if (this.idUsuario) {
      this.teamStatsCacheService.getTeamStats(this.idUsuario, this.tipoConsulta, 0).then(data => {
        this.dadosMes = data;
        this.defineDetalhesNivelMeta();
      });
    }
  }

  getDadosMesAnterior() {
    if (this.idUsuario) {
      this.teamStatsCacheService.getTeamStats(this.idUsuario, this.tipoConsulta, this.mesAnterior).then(data => {
        this.dadosMes = data;
        this.defineDetalhesNivelMeta();
      });
    }
  }

  updateGrafico() {
    // this.chartLoaded = null;
    // if ((this.values.length > this.selectedDays) && (this.labels.length > this.selectedDays)) {
    //   setTimeout(() => {
    //     this.values = this.values.slice(-this.selectedDays);
    //     this.labels = this.labels.slice(-this.selectedDays);
    //     this.chartLoaded = 'yes';
    //   }, 500);

    // } else {
    //   this.getDadosGrafico();
    // }
  }

  defineDetalhesNivelMeta() {
    const pointsPerLevel = this.goalsConfig?.pointsPerLevel;
    let nivelAtual = 0;
    if (pointsPerLevel && pointsPerLevel > 0) {
      nivelAtual = Math.floor(this.dadosMes?.pontos / pointsPerLevel);
    }
    let maxLevel = this.goalsConfig?.maxLevel || 0;
    let diferencaNiveisMax = nivelAtual - maxLevel;
    let qtdeEstrelas = this.qtdeEstrelas(diferencaNiveisMax);

    this.nivelMeta = {
      nivel: nivelAtual,
      maxLevel: maxLevel,
      estrelas: qtdeEstrelas > 6 ? 6 : qtdeEstrelas,
      tema: qtdeEstrelas > 6 ? 'gold' : 'red'
    };

    // Define o status do jogador após definir os detalhes do nível
    this.defineStatusJogador();
  }

  qtdeEstrelas(diferencaNiveisMax: number) {
    if (diferencaNiveisMax < 0) {
      return 0
    }
    return (Math.floor(diferencaNiveisMax / this.qtdeNiveisExtrasPorEstrela()) + 1);
  }

  defineStatusJogador() {
    if (!this.nivelMeta) return;
    
    let diferencaNiveisMax = this.nivelMeta.nivel - this.nivelMeta.maxLevel;
    
    // Calcula a porcentagem baseada na diferença de níveis
    let porcentagem = (diferencaNiveisMax / this.nivelMeta.maxLevel) * 100;
    
    // Lógica baseada em porcentagem
    if (porcentagem >= -100 && porcentagem <= -66) {
      this.statusJogador = this.statusJogadorOptions[0];
    } else if (porcentagem >= -65 && porcentagem <= -33) {
      this.statusJogador = this.statusJogadorOptions[1];
    } else if (porcentagem >= -32 && porcentagem <= -1) {
      this.statusJogador = this.statusJogadorOptions[2];
    } else if (porcentagem === 0) {
      this.statusJogador = this.statusJogadorOptions[3];
    } else if (porcentagem > 0) {
      this.statusJogador = this.statusJogadorOptions[4];
    } else {
      // Caso seja negativo (abaixo do nível máximo)
      this.statusJogador = this.statusJogadorOptions[0];
    }
    
  }

  private qtdeNiveisExtrasPorEstrela() {
    return NIVEL_POR_ESTRELA;
  }

  get macrosFinalizadasMes() {
    return this.dadosMes?.completedDeliveries || 0;
    //AQUI
  }

  async loadAliases() {
    this.aliases = await this.aliasService.getAliases();
  }

  get deliveryAlias(): string {
    return this.aliases?.deliveryAlias || 'Entregas';
  }

  get goalsConfigReady(): boolean {
    return this.goalsConfigService.isConfigLoaded();
  }

  get individualMonthlyGoal(): number {
    return this.goalsConfig?.individualMonthlyGoal || 100;
  }
  

  async ngOnChanges() {
    this.init();
    this.loadAliases();
    this.goalsConfig = await this.goalsConfigService.getGoalsConfig();
    this.features = await this.featuresService.getFeatures();
  }

  isLevelsEnabled(): boolean {
    return this.featuresService.isLevelsEnabled();
  }

  // TO DO: Vamos ter que usar isso aqui quando tivermos o sistema de medalhas;
  // isAchievementsEnabled(): boolean {
  //   return this.featuresService.isAchievementsEnabled();
  // }

  getPercentMacro(individualMonthlyGoal: number) {
    return Math.floor((this.macrosFinalizadasMes / individualMonthlyGoal) * 100)
  }

  getLevelPercent(maxLevel: number) {
    if (!maxLevel || maxLevel <= 0) return 0;
    return Math.floor((this.nivelMeta.nivel / maxLevel) * 100); 
  }

  get tipoConsulta() {
    return TIPO_CONSULTA_COLABORADOR;
  }

  /**
   * Retorna a configuração do shimmer baseada no estado das funcionalidades
   * Se achievements estiver habilitado, usa largura de 50% (dois cards lado a lado)
   * Se achievements estiver desabilitado, usa largura de 100% (um card ocupando toda a largura)
   */
  getShimmerConfig(): any {
    const isLevelsEnabled = this.isLevelsEnabled();
    const width = isLevelsEnabled ? 'calc(50% - 40px)' : 'calc(100%)';
    
    return {
      height: 112,
      width: width,
      borderRadius: 16
    };
  }

  /**
   * Limpa o cache de estatísticas do colaborador
   */
  public clearStatsCache() {
    this.teamStatsCacheService.clearAllCache();
  }

}
