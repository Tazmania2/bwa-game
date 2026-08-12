export type GameRulesUpdateAudience = 'player' | 'team' | 'collaborator';

export interface GameRulesUpdateNewGoal {
  label: string;
  valueLabel: string;
}

export interface GameRulesUpdateAnnouncement {
  id: string;
  /** Primeiro mês (YYYY-MM) em que o aviso deve aparecer. */
  effectiveFrom: string;
  title: string;
  body: string;
  previousValueLabel: string;
  newValueLabel: string;
  effectiveMonthLabel: string;
  /** Metas novas destacadas no banner (além da mudança 90% → 95%). */
  newGoals?: GameRulesUpdateNewGoal[];
}
