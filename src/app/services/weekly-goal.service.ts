import { Injectable } from '@angular/core';

/**
 * Quebra da meta mensal por semana (sprint/moco-01, feature 7).
 *
 * Os pesos sao regra de negocio, nao dado: a meta do mes e distribuida em
 * 10% / 20% / 20% / 50% da primeira a quarta semana. Ficam aqui como constante
 * exportada para existirem em UM lugar so — se a regra mudar, muda aqui e o
 * componente acompanha.
 *
 * ESTADO (2026-08-04): o REALIZADO deixou de vir de fixture. Quem usa o
 * componente passa as linhas de `GET /game/reports/team/daily-finished-stats`,
 * que devolve serie DIARIA e ja era consumido pelo front — agregar em baldes
 * semanais e trabalho de cliente, sem endpoint novo. Sem essas linhas o
 * componente nao renderiza: um "realizado" inventado num medidor de meta le-se
 * como medicao.
 */

/** Peso de cada semana sobre a meta do mes. Soma 1. */
export const WEEKLY_GOAL_WEIGHTS: readonly number[] = [0.1, 0.2, 0.2, 0.5];

/**
 * Linha diaria minima que o servico consome.
 *
 * Tipada estruturalmente de proposito: aceita
 * `Game4uReportsTeamDailyFinishedStatRow` e o alias
 * `TeamDailyFinishedStatsRow` do painel de equipa sem acoplar este servico a
 * nenhum dos dois.
 */
export interface WeeklyGoalDailyRow {
  /** Dia em ISO `YYYY-MM-DD` ou ISO date-time. */
  day: string;
  /** Pontos somados no dia. Ausente conta como zero. */
  points_sum?: number;
}

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

export interface WeeklyProgressRow {
  week: number;
  achieved_points: number;
}

/** Numero de baldes. Amarrado ao tamanho de WEEKLY_GOAL_WEIGHTS de proposito. */
const WEEK_BUCKETS = WEEKLY_GOAL_WEIGHTS.length;

@Injectable({ providedIn: 'root' })
export class WeeklyGoalService {
  /**
   * Balde semanal de um dia do mes, por DIA DO MES: 1-7, 8-14, 15-21, 22-fim.
   *
   * Nao sao semanas ISO. A escolha e deliberada e e a unica compativel com os
   * pesos 10/20/20/50: um mes real transborda quatro semanas de calendario
   * (agosto de 2026 toca seis semanas ISO parciais), e um quinto balde nao tem
   * peso definido. Com dia-do-mes ha sempre exatamente quatro baldes e o
   * ultimo absorve os dias 22 a 31.
   *
   * O fixture antigo tinha convenientemente quatro linhas e escondia isto: a
   * versao anterior de `buildSlices` lia `byWeek.get(week)` so de 1 a 4, entao
   * com dado real qualquer ponto numa quinta semana desaparecia em silencio.
   *
   * Para trocar a regra (semanas ISO, semanas uteis), muda-se esta funcao e
   * revisitam-se os pesos. Mais nada depende da definicao.
   */
  static weekBucketForDayOfMonth(dayOfMonth: number): number {
    if (!Number.isFinite(dayOfMonth) || dayOfMonth < 1) {
      return 1;
    }
    return Math.min(Math.floor((dayOfMonth - 1) / 7) + 1, WEEK_BUCKETS);
  }

  /**
   * Agrega a serie diaria em realizado por semana.
   *
   * `monthRef` restringe as linhas ao mes de referencia. E necessario porque o
   * intervalo pedido ao endpoint pode atravessar a fronteira do mes (o painel
   * de equipa pede `startOf('day')`..`endOf('day')` de um intervalo escolhido
   * pelo utilizador), e somar dias de outro mes na "1a semana" seria errado sem
   * dar erro nenhum.
   */
  bucketDailyRows(
    rows: readonly WeeklyGoalDailyRow[] | null | undefined,
    monthRef?: Date | string | null,
  ): WeeklyProgressRow[] {
    const totals = new Map<number, number>();
    for (let week = 1; week <= WEEK_BUCKETS; week++) {
      totals.set(week, 0);
    }

    const ref = parseMonthRef(monthRef);

    for (const row of rows ?? []) {
      const parsed = parseDay(row?.day);
      if (!parsed) {
        continue;
      }
      if (ref && (parsed.year !== ref.year || parsed.month !== ref.month)) {
        continue;
      }
      const points = Number(row?.points_sum);
      if (!Number.isFinite(points) || points <= 0) {
        continue;
      }
      const week = WeeklyGoalService.weekBucketForDayOfMonth(parsed.day);
      totals.set(week, (totals.get(week) ?? 0) + points);
    }

    return Array.from(totals.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([week, achieved_points]) => ({ week, achieved_points }));
  }

  /**
   * Distribui `monthTarget` pelas quatro semanas.
   *
   * O arredondamento e feito com acumulado, e a ultima semana recebe o resto,
   * para que a soma das metas semanais bata EXATAMENTE com a meta do mes.
   * Arredondar cada semana isoladamente deixaria a soma diferente do total —
   * o tipo de divergencia de 1 ponto que faz um gestor perder a tarde.
   */
  buildSlices(monthTarget: number, achieved: readonly WeeklyProgressRow[]): WeeklyGoalSlice[] {
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

/**
 * Le `YYYY-MM-DD` (com ou sem parte horaria) sem passar pelo `Date`.
 *
 * `new Date('2026-08-01')` e interpretado como UTC e, em America/Sao_Paulo,
 * `getDate()` devolve 31 de julho. Num agregador por dia do mes isso move
 * pontos de balde — e, no dia 1, para fora do mes. Por isso a data e lida do
 * texto.
 */
function parseDay(raw: string | undefined | null): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(raw ?? '').trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { year, month, day };
}

function parseMonthRef(raw: Date | string | null | undefined): { year: number; month: number } | null {
  if (!raw) {
    return null;
  }
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime())
      ? null
      : { year: raw.getFullYear(), month: raw.getMonth() + 1 };
  }
  const parsed = parseDay(raw);
  return parsed ? { year: parsed.year, month: parsed.month } : null;
}
