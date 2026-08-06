import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

/**
 * Indicadores de economia do dashboard organizacional (sprint/moco-01, feature 10).
 *
 * ESTADO: MOCK, e este e o mais bloqueado dos itens do sprint. Uma varredura
 * nos transforms Mozart nao encontrou NENHUMA coluna de custo — nem `custo`,
 * nem `cost_`, nem `cost_per`. Nao existe fonte de custo no data lake hoje. O
 * candidato provavel e o modulo `omie-cron` da API (Omie = ERP financeiro),
 * mas isso nao foi confirmado e nao se inventa denominador financeiro.
 *
 * Quando a fonte existir, trocar apenas `load()`. Os nomes `mtd_value` /
 * `prev_mtd_value` espelham a convencao `mtd_*` / `prev_mtd_*` do mart 13, e a
 * comparacao e contra o MES ANTERIOR (decisao do operador em 2026-08-03), que
 * e o mesmo eixo que `compare.vs_prev_mtd_*` ja usa nos cartoes hero.
 */

export interface EconomyIndicator {
  id: string;
  label: string;
  mtd_value: number;
  prev_mtd_value: number | null;
}

export interface EconomyIndicatorsPayload {
  cache_month: string | null;
  currency: string;
  indicators: EconomyIndicator[];
  /** `true` enquanto os numeros vierem do fixture. Renderizado como aviso. */
  isMock: boolean;
}

const MOCK_URL = 'assets/mock/org-economy-indicators.json';

const EMPTY: EconomyIndicatorsPayload = {
  cache_month: null,
  currency: 'BRL',
  indicators: [],
  isMock: true,
};

@Injectable({ providedIn: 'root' })
export class EconomyIndicatorsService {
  private payload$: Observable<EconomyIndicatorsPayload> | null = null;

  constructor(private http: HttpClient) {}

  load(): Observable<EconomyIndicatorsPayload> {
    if (!this.payload$) {
      this.payload$ = this.http
        .get<Partial<EconomyIndicatorsPayload> & { _source?: string }>(MOCK_URL)
        .pipe(
          map(res => ({
            cache_month: res?.cache_month ?? null,
            currency: res?.currency || 'BRL',
            indicators: Array.isArray(res?.indicators) ? res!.indicators! : [],
            isMock: (res?._source ?? 'mock') === 'mock',
          })),
          catchError(err => {
            // Indicadores de economia sao um acrescimo ao dashboard; se
            // falharem, a secao some e o resto da pagina segue intacta.
            console.warn('[EconomyIndicatorsService] falha ao carregar indicadores (mock):', err);
            return of(EMPTY);
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.payload$;
  }

  /**
   * Variacao percentual contra o mes anterior.
   *
   * `null` quando nao ha mes anterior ou quando ele e zero — sem base nao
   * existe percentual, e mostrar 0% ou infinito seria mentira.
   */
  static deltaPct(indicator: EconomyIndicator): number | null {
    const prev = indicator.prev_mtd_value;
    if (prev == null || prev === 0) {
      return null;
    }
    return ((indicator.mtd_value - prev) / Math.abs(prev)) * 100;
  }

  /**
   * Tom do delta. INVERTIDO em relacao aos KPIs operacionais: nestes
   * indicadores o valor e CUSTO, entao cair e bom. Um `delta-pill--positive`
   * verde num custo que subiu seria exatamente o tipo de indicador que engana
   * quem le rapido.
   */
  static deltaTone(indicator: EconomyIndicator): 'positive' | 'negative' | 'neutral' {
    const pct = EconomyIndicatorsService.deltaPct(indicator);
    if (pct == null || Math.abs(pct) < 0.05) {
      return 'neutral';
    }
    return pct < 0 ? 'positive' : 'negative';
  }
}
