/**
 * Temporada hardcoded (temporário): 01/08/2026–31/12/2026.
 * Totais de “temporada” / carteira usam o cache de agosto (`month=2026-08`).
 */
export const HARDCODED_SEASON_START = '2026-08-01';
export const HARDCODED_SEASON_END = '2026-12-31';

/** Query param `month` para carteira e totais de temporada. */
export const SEASON_PROXY_MONTH_PARAM = '2026-08';

/** Primeiro dia de agosto/2026 (mês local). */
export function getSeasonProxyMonth(): Date {
  return new Date(2026, 7, 1, 0, 0, 0, 0);
}

export function isSeasonProxyMonth(month: Date | null | undefined): boolean {
  if (!(month instanceof Date) || Number.isNaN(month.getTime())) {
    return false;
  }
  return month.getFullYear() === 2026 && month.getMonth() === 7;
}
