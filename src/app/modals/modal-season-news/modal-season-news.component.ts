import { Component } from '@angular/core';

export interface SeasonNewsGoalExample {
  label: string;
  current: number;
  target: number;
  superTarget?: number;
  unit?: string;
  color: 'red' | 'yellow' | 'green' | 'pink' | 'gray';
  /** Meta nova da Temporada 1 (exibe a tag Novo). */
  isNew?: boolean;
}

@Component({
  selector: 'app-modal-season-news',
  templateUrl: './modal-season-news.component.html',
  styleUrls: ['./modal-season-news.component.scss'],
})
export class ModalSeasonNewsComponent {
  /** PDF oficial de regras da Temporada 1 (agosto/2026). */
  readonly rulesPdfUrl =
    'https://zarptqqopvuwognexpon.supabase.co/storage/v1/object/public/rulebook/bwa-pdf/temporada-1-agosto/REGRAS_BWA%20GAME_12082026_V2.pdf';

  /** Exemplos ilustrativos (hardcoded) das 5 metas do painel. */
  readonly goalExamples: SeasonNewsGoalExample[] = [
    {
      label: 'Pontos no mês',
      current: 820,
      target: 1000,
      unit: 'pts',
      color: 'red',
    },
    {
      label: 'Entregas no Prazo',
      current: 100,
      target: 95,
      superTarget: 100,
      unit: '%',
      color: 'yellow',
    },
    {
      label: 'Clientes G4 no prazo',
      current: 94,
      target: 100,
      unit: '%',
      color: 'red',
      isNew: true,
    },
    {
      label: 'Onboarding no prazo',
      current: 100,
      target: 100,
      unit: '%',
      color: 'green',
      isNew: true,
    },
    {
      label: 'Clientes risco no prazo',
      current: 91,
      target: 100,
      unit: '%',
      color: 'red',
      isNew: true,
    },
  ];

  trackByLabel(_index: number, goal: SeasonNewsGoalExample): string {
    return goal.label;
  }
}
