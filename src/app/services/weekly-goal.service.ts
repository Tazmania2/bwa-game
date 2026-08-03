import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

/**
 * Quebra da meta mensal por semana (sprint/moco-01, feature 7).
 *
 * Os pesos sao regra de negocio, nao dado: a meta do mes e distribuida em
 * 10% / 20% / 20% / 50% da primeira a quarta semana. Ficam aqui como constante
 * exportada para existirem em UM lugar so — se a regra mudar, muda aqui e o
 * componente acompanha.
 *
 * ESTADO: o REALIZADO por semana vem de `assets/mock/weekly-goal-progress.json`.
 * Diferente das features 5 e 10, esta tem caminho claro para dado real sem
 * endpoint novo: `GET /game/reports/team/daily-finished-stats` ja e consumido
 * pelo front (team-management-dashboard, game4u-api.service) e devolve serie
 * DIARIA — agregar em baldes semanais e trabalho de cliente, nao de backend.
 * Nao foi feito agora porque o sprint pediu a tela primeiro.
 */

/** Peso de cada semana sobre a meta do mes. Soma 1. */
export const WEEKLY_GOAL_WEIGHTS: readonly number[] = [0.1, 0.2, 0.2, 0.5];

export interface WeeklyGoalSlice {
  week: number;
  /** Percentual da meta mensal atribuido a esta semana (10, 20, 20, 50). */
  weightPct: number;
  /** Meta em pontos desta semana. */
  targetPoints: number;
  /** Realizado em pontos. */
  achievedPoints: number;
  /** Progresso 0-100 desta semana contra a propria meta. */
  progressPct: number;
}

interface WeeklyProgressRow {
  week: number;
  achieved_points: number;
}

const MOCK_URL = 'assets/mock/weekly-goal-progress.json';

@Injectable({ providedIn: 'root' })
export class WeeklyGoalService {
  private progress$: Observable<WeeklyProgressRow[]> | null = null;

  constructor(private http: HttpClient) {}

  loadAchieved(): Observable<WeeklyProgressRow[]> {
    if (!this.progress$) {
      this.progress$ = this.http.get<{ weeks?: WeeklyProgressRow[] }>(MOCK_URL).pipe(
        map(res => (Array.isArray(res?.weeks) ? res!.weeks! : [])),
        catchError(err => {
          console.warn('[WeeklyGoalService] falha ao carregar realizado semanal (mock):', err);
          return of([] as WeeklyProgressRow[]);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.progress$;
  }

  /**
   * Distribui `monthTarget` pelas quatro semanas.
   *
   * O arredondamento e feito com acumulado, e a ultima semana recebe o resto,
   * para que a soma das metas semanais bata EXATAMENTE com a meta do mes.
   * Arredondar cada semana isoladamente deixaria a soma diferente do total —
   * o tipo de divergencia de 1 ponto que faz um gestor perder a tarde.
   */
  buildSlices(monthTarget: number, achieved: WeeklyProgressRow[]): WeeklyGoalSlice[] {
    const target = Number.isFinite(monthTarget) && monthTarget > 0 ? monthTarget : 0;
    const byWeek = new Map(achieved.map(row => [row.week, row.achieved_points]));

    let allocated = 0;
    return WEEKLY_GOAL_WEIGHTS.map((weight, index) => {
      const week = index + 1;
      const isLast = index === WEEKLY_GOAL_WEIGHTS.length - 1;
      const targetPoints = isLast
        ? Math.max(target - allocated, 0)
        : Math.round(target * weight);
      allocated += targetPoints;

      const achievedPoints = Math.max(byWeek.get(week) ?? 0, 0);
      const progressPct =
        targetPoints > 0 ? Math.min((achievedPoints / targetPoints) * 100, 100) : 0;

      return {
        week,
        weightPct: Math.round(weight * 100),
        targetPoints,
        achievedPoints,
        progressPct,
      };
    });
  }
}
