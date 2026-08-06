export type OnTimeSegmentKey = 'g4' | 'onboarding' | 'riscoDeChurn';

export interface OnTimeSegmentReading {
  current: number | null;
  /** Meta e supermeta usam o mesmo valor no contrato cached. */
  goal: number | null;
  /**
   * Há cliente pendente com a tag no mês.
   * `false` desliga o anel. Ausente na API conta como `true`.
   */
  hasPending?: boolean;
}

export interface OnTimeSegmentPercents {
  g4: OnTimeSegmentReading;
  onboarding: OnTimeSegmentReading;
  riscoDeChurn: OnTimeSegmentReading;
}

export const ON_TIME_SEGMENT_GOAL_FALLBACK = 100;

function emptyReading(): OnTimeSegmentReading {
  return { current: null, goal: null, hasPending: true };
}

export const EMPTY_ON_TIME_SEGMENT_PERCENTS: OnTimeSegmentPercents = {
  g4: emptyReading(),
  onboarding: emptyReading(),
  riscoDeChurn: emptyReading()
};

export function cloneOnTimeSegmentPercents(
  value: OnTimeSegmentPercents = EMPTY_ON_TIME_SEGMENT_PERCENTS
): OnTimeSegmentPercents {
  return {
    g4: { ...value.g4 },
    onboarding: { ...value.onboarding },
    riscoDeChurn: { ...value.riscoDeChurn }
  };
}

const SEGMENT_CURRENT_ALIASES: Record<OnTimeSegmentKey, readonly string[]> = {
  g4: ['month_on_time_pct_acessorias_g4', 'on_time_pct_acessorias_g4', 'onTimePctAcessoriasG4'],
  onboarding: [
    'month_on_time_pct_acessorias_onboarding',
    'on_time_pct_acessorias_onboarding',
    'onTimePctAcessoriasOnboarding'
  ],
  riscoDeChurn: [
    'month_on_time_pct_acessorias_risco_de_churn',
    'on_time_pct_acessorias_risco_de_churn',
    'onTimePctAcessoriasRiscoDeChurn'
  ]
};

const SEGMENT_GOAL_ALIASES: Record<OnTimeSegmentKey, readonly string[]> = {
  g4: [
    'month_on_time_goal_pct_acessorias_g4',
    'on_time_goal_pct_acessorias_g4',
    'onTimeGoalPctAcessoriasG4'
  ],
  onboarding: [
    'month_on_time_goal_pct_acessorias_onboarding',
    'on_time_goal_pct_acessorias_onboarding',
    'onTimeGoalPctAcessoriasOnboarding'
  ],
  riscoDeChurn: [
    'month_on_time_goal_pct_acessorias_risco_de_churn',
    'on_time_goal_pct_acessorias_risco_de_churn',
    'onTimeGoalPctAcessoriasRiscoDeChurn'
  ]
};

const SEGMENT_HAS_PENDING_ALIASES: Record<OnTimeSegmentKey, readonly string[]> = {
  g4: [
    'month_has_pending_acessorias_g4',
    'has_pending_acessorias_g4',
    'hasPendingAcessoriasG4',
    'monthHasPendingAcessoriasG4'
  ],
  onboarding: [
    'month_has_pending_acessorias_onboarding',
    'has_pending_acessorias_onboarding',
    'hasPendingAcessoriasOnboarding',
    'monthHasPendingAcessoriasOnboarding'
  ],
  riscoDeChurn: [
    'month_has_pending_acessorias_risco_de_churn',
    'has_pending_acessorias_risco_de_churn',
    'hasPendingAcessoriasRiscoDeChurn',
    'monthHasPendingAcessoriasRiscoDeChurn'
  ]
};

/** Normaliza % no prazo (0–100). Aceita fração 0–1. */
export function readOnTimePctNumber(raw: unknown): number | null {
  if (raw == null || (typeof raw === 'string' && String(raw).trim() === '')) {
    return null;
  }
  let n = Number(raw);
  if (!Number.isFinite(n)) {
    return null;
  }
  if (n > 0 && n <= 1) {
    n = n * 100;
  }
  return Math.min(100, Math.max(0, Math.round(n * 100) / 100));
}

export function readOnTimeSegmentPercents(source: unknown): OnTimeSegmentPercents {
  if (!source || typeof source !== 'object') {
    return cloneOnTimeSegmentPercents();
  }
  const o = source as Record<string, unknown>;
  return {
    g4: readSegmentReading(o, 'g4'),
    onboarding: readSegmentReading(o, 'onboarding'),
    riscoDeChurn: readSegmentReading(o, 'riscoDeChurn')
  };
}

function readSegmentReading(o: Record<string, unknown>, key: OnTimeSegmentKey): OnTimeSegmentReading {
  return {
    current: readFirstOnTimeAlias(o, SEGMENT_CURRENT_ALIASES[key]),
    goal: readFirstOnTimeAlias(o, SEGMENT_GOAL_ALIASES[key]),
    hasPending: readFirstBooleanAlias(o, SEGMENT_HAS_PENDING_ALIASES[key], true)
  };
}

function readFirstOnTimeAlias(o: Record<string, unknown>, aliases: readonly string[]): number | null {
  for (const key of aliases) {
    if (!(key in o)) {
      continue;
    }
    const value = readOnTimePctNumber(o[key]);
    if (value != null) {
      return value;
    }
  }
  return null;
}

function readOptionalBoolean(raw: unknown): boolean | null {
  if (raw === true || raw === 1 || raw === '1' || raw === 'true' || raw === 'True') {
    return true;
  }
  if (raw === false || raw === 0 || raw === '0' || raw === 'false' || raw === 'False') {
    return false;
  }
  return null;
}

function readFirstBooleanAlias(
  o: Record<string, unknown>,
  aliases: readonly string[],
  fallback: boolean
): boolean {
  for (const key of aliases) {
    if (!(key in o)) {
      continue;
    }
    const value = readOptionalBoolean(o[key]);
    if (value != null) {
      return value;
    }
  }
  return fallback;
}
