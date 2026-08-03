import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { KPIData } from '@model/gamification-dashboard.model';

/**
 * Metas de SLA por tipo de empresa critica (sprint/moco-01, feature 5).
 *
 * ESTADO: MOCK. Le `assets/mock/sla-goals.json`. Nao existe fonte real — nem a
 * API nem os marts 12/13 expoem meta por segmento; o que existe la e a
 * CONTAGEM de clientes por tag (`mtd_clients_acessorias_g4`,
 * `..._onboarding`, `..._risco_de_churn`), nao a meta de % no prazo deles.
 *
 * Quando a fonte real existir, trocar apenas `loadConfig()`. O restante — o
 * formato `KPIData` e o registro no painel — nao muda, porque os tres
 * marcadores usam o MESMO componente ja renderizado em "Metas da Equipe"
 * (`c4u-kpi-circular-progress`, via o `*ngFor` sobre `teamKPIs`). Nenhum
 * template novo foi criado para eles.
 *
 * `modificador` e carregado e preservado no fixture mas NAO e aplicado aqui:
 * o medidor circular exibe current / meta / supermeta apenas. O modificador
 * pertence ao cadastro (lado admin-saas) e a regra de pontuacao, nao a
 * exibicao.
 */

export interface SlaGoalConfig {
  id: string;
  /** Chave do segmento nos marts 12/13 — o vinculo com o dado real. */
  segment: string;
  nome: string;
  meta: number;
  supermeta: number;
  modificador: number;
  unit: string;
  /** MOCK: medicao atual. Vem da API quando a fonte real existir. */
  current: number;
}

const MOCK_URL = 'assets/mock/sla-goals.json';

@Injectable({ providedIn: 'root' })
export class SlaGoalsService {
  private config$: Observable<SlaGoalConfig[]> | null = null;

  constructor(private http: HttpClient) {}

  /** Ids emitidos por este servico. Usado para nao duplicar em re-render. */
  static readonly SLA_KPI_IDS: readonly string[] = [
    'on-time-g4',
    'on-time-onboarding',
    'on-time-risco',
  ];

  loadConfig(): Observable<SlaGoalConfig[]> {
    if (!this.config$) {
      this.config$ = this.http.get<{ goals?: SlaGoalConfig[] }>(MOCK_URL).pipe(
        map(res => (Array.isArray(res?.goals) ? res.goals : [])),
        catchError(err => {
          // Falha aqui nao pode derrubar o painel: as metas de SLA sao um
          // acrescimo aos medidores existentes, nao um pre-requisito deles.
          console.warn('[SlaGoalsService] falha ao carregar metas de SLA (mock):', err);
          return of([] as SlaGoalConfig[]);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.config$;
  }

  /**
   * Converte a configuracao em `KPIData`, o mesmo contrato que "Entregas no
   * Prazo" ja usa. `colorResolver` e injetado para reaproveitar exatamente a
   * regra de cor do KPIService em vez de duplica-la.
   */
  toKpiData(
    config: SlaGoalConfig[],
    colorResolver: (current: number, target: number, superTarget: number) => KPIData['color'],
  ): KPIData[] {
    return config.map(goal => {
      const superTarget = goal.supermeta > 0 ? goal.supermeta : 100;
      return {
        id: goal.id,
        label: goal.nome,
        current: goal.current,
        target: goal.meta,
        superTarget,
        unit: goal.unit || '%',
        color: colorResolver(goal.current, goal.meta, superTarget),
        percentage: Math.min(Math.max(goal.current, 0), 100),
      };
    });
  }
}
