import { Injectable } from '@angular/core';
import { KPIData } from '@model/gamification-dashboard.model';
import type { OnTimeSegmentKey, OnTimeSegmentPercents } from '@utils/on-time-pct.util';
import {
  EMPTY_ON_TIME_SEGMENT_PERCENTS,
  ON_TIME_SEGMENT_GOAL_FALLBACK
} from '@utils/on-time-pct.util';

export interface OnTimeSegmentGoalDef {
  id: string;
  segmentKey: OnTimeSegmentKey;
  nome: string;
}

/**
 * Anéis de % no prazo por tag Acessórias.
 * Current e goal vêm da API cached. Meta e supermeta são o mesmo valor.
 */
export const ON_TIME_SEGMENT_GOAL_DEFS: readonly OnTimeSegmentGoalDef[] = [
  {
    id: 'on-time-g4',
    segmentKey: 'g4',
    nome: 'Clientes G4 no prazo'
  },
  {
    id: 'on-time-onboarding',
    segmentKey: 'onboarding',
    nome: 'Onboarding no prazo'
  },
  {
    id: 'on-time-risco',
    segmentKey: 'riscoDeChurn',
    nome: 'Clientes risco no prazo'
  }
];

const ON_TIME_SEGMENT_KPI_IDS: readonly string[] = ON_TIME_SEGMENT_GOAL_DEFS.map(def => def.id);

@Injectable({ providedIn: 'root' })
export class SlaGoalsService {
  static readonly SLA_KPI_IDS: readonly string[] = ON_TIME_SEGMENT_KPI_IDS;

  static readonly ON_TIME_KPI_ORDER: readonly string[] = ['entregas-prazo', ...ON_TIME_SEGMENT_KPI_IDS];

  toKpiData(
    segments: OnTimeSegmentPercents | null | undefined,
    colorResolver: (current: number, target: number, superTarget: number) => KPIData['color']
  ): KPIData[] {
    const values = segments ?? EMPTY_ON_TIME_SEGMENT_PERCENTS;
    return ON_TIME_SEGMENT_GOAL_DEFS.map(goal => {
      const reading = values[goal.segmentKey];
      const raw = reading?.current;
      const disabled = reading?.hasPending === false;
      const missing = !disabled && (raw == null || !Number.isFinite(raw));
      const current = missing || disabled || raw == null ? 0 : raw;
      const target = reading?.goal != null && Number.isFinite(reading.goal)
        ? reading.goal
        : ON_TIME_SEGMENT_GOAL_FALLBACK;
      return {
        id: goal.id,
        label: goal.nome,
        current,
        target,
        superTarget: target,
        unit: '%',
        color: missing || disabled ? 'gray' : colorResolver(current, target, target),
        percentage: missing || disabled ? 0 : Math.min(Math.max(current, 0), 100),
        isMissing: missing,
        isDisabled: disabled
      };
    });
  }
}
