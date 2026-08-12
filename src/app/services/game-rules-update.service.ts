import { Injectable } from '@angular/core';
import {
  formatMonthYearPtBr,
  monthKeyFromDate,
  ON_TIME_DELIVERY_GOAL_CURRENT,
  ON_TIME_DELIVERY_GOAL_EFFECTIVE_FROM,
  ON_TIME_DELIVERY_GOAL_INCREASE_ENABLED,
  ON_TIME_DELIVERY_GOAL_LEGACY
} from '@app/constants/on-time-delivery-goal';
import {
  GameRulesUpdateAnnouncement,
  GameRulesUpdateAudience
} from '@model/game-rules-update.model';
import { ON_TIME_SEGMENT_GOAL_FALLBACK } from '@utils/on-time-pct.util';

const DISMISS_STORAGE_PREFIX = 'bwa-game-rules-update-dismissed:';

/** Id novo para reexibir o aviso após inclusão das 3 metas por tag. */
const ON_TIME_GOALS_ANNOUNCEMENT_ID = 'on-time-delivery-and-segment-goals-2026-07';

@Injectable({
  providedIn: 'root'
})
export class GameRulesUpdateService {
  private readonly announcements: ReadonlyArray<{
    id: string;
    effectiveFrom: string;
    build: (audience: GameRulesUpdateAudience, effectiveMonth: Date) => GameRulesUpdateAnnouncement;
  }> = ON_TIME_DELIVERY_GOAL_INCREASE_ENABLED
    ? [
        {
          id: ON_TIME_GOALS_ANNOUNCEMENT_ID,
          effectiveFrom: ON_TIME_DELIVERY_GOAL_EFFECTIVE_FROM,
          build: (audience, effectiveMonth) => this.buildOnTimeGoalJuly2026(audience, effectiveMonth)
        }
      ]
    : [];

  getVisibleAnnouncements(
    selectedMonth: Date | undefined | null,
    audience: GameRulesUpdateAudience
  ): GameRulesUpdateAnnouncement[] {
    if (!selectedMonth) {
      return [];
    }

    const monthKey = monthKeyFromDate(selectedMonth);
    const calendarMonthKey = monthKeyFromDate(new Date());
    return this.announcements
      .filter(
        item =>
          monthKey >= item.effectiveFrom &&
          calendarMonthKey >= item.effectiveFrom &&
          !this.isDismissed(item.id)
      )
      .map(item => item.build(audience, selectedMonth));
  }

  dismissAnnouncement(id: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(`${DISMISS_STORAGE_PREFIX}${id}`, '1');
    } catch {
      // ignore quota / private mode
    }
  }

  isDismissed(id: string): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    try {
      return localStorage.getItem(`${DISMISS_STORAGE_PREFIX}${id}`) === '1';
    } catch {
      return false;
    }
  }

  private buildOnTimeGoalJuly2026(
    audience: GameRulesUpdateAudience,
    effectiveMonth: Date
  ): GameRulesUpdateAnnouncement {
    const effectiveMonthLabel = formatMonthYearPtBr(effectiveMonth);
    const segmentGoalLabel = `${ON_TIME_SEGMENT_GOAL_FALLBACK}%`;
    const newGoals = [
      { label: 'Clientes G4 no prazo', valueLabel: segmentGoalLabel },
      { label: 'Onboarding no prazo', valueLabel: segmentGoalLabel },
      { label: 'Clientes em risco no prazo', valueLabel: segmentGoalLabel }
    ];

    const sharedBody =
      'Buscamos excelência na experiência dos clientes: prazos cumpridos significam confiança, previsibilidade e saúde da operação. ' +
      'Atingir essas metas fortalece a conversão de pontos em moedas e o impacto positivo que entregamos todos os dias.';

    const audienceLead: Record<GameRulesUpdateAudience, string> = {
      player:
        'Agora há 3 novas metas no painel: Clientes G4 no prazo, Onboarding no prazo e Clientes em risco no prazo. Cada uma tem meta de 100%.',
      collaborator:
        'Agora há 3 novas metas no painel deste colaborador: Clientes G4 no prazo, Onboarding no prazo e Clientes em risco no prazo. Cada uma tem meta de 100%.',
      team:
        'Agora o painel do time também acompanha 3 novas metas: Clientes G4 no prazo, Onboarding no prazo e Clientes em risco no prazo. Cada uma tem meta de 100%.'
    };

    return {
      id: ON_TIME_GOALS_ANNOUNCEMENT_ID,
      effectiveFrom: ON_TIME_DELIVERY_GOAL_EFFECTIVE_FROM,
      title: 'Metas de entregas no prazo atualizadas',
      body: `${audienceLead[audience]} ${sharedBody}`,
      previousValueLabel: `${ON_TIME_DELIVERY_GOAL_LEGACY}%`,
      newValueLabel: `${ON_TIME_DELIVERY_GOAL_CURRENT}%`,
      effectiveMonthLabel,
      newGoals
    };
  }
}
