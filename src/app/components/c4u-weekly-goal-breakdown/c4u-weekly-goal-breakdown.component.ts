import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  WeeklyGoalDailyRow,
  WeeklyGoalService,
  WeeklyGoalSlice,
} from '@app/services/weekly-goal.service';

/**
 * Quebra semanal da meta mensal (feature 7): 10% / 20% / 20% / 50%.
 *
 * Renderiza ao lado do anel de "Pontos do mes"
 * (`c4u-monthly-points-goal-progress`), que aparece em DOIS paineis — o
 * individual (gamification-dashboard) e o de equipe (team-management). Por
 * isso e um componente irmao e nao markup solto: entra nos dois sem duplicar.
 *
 * Recebe a meta do mes por `@Input` em vez de busca-la, para consumir
 * exatamente o mesmo `monthlyPointsProgressData.target` que o anel ao lado usa.
 * Buscar por conta propria abriria espaco para os dois discordarem na tela.
 *
 * O REALIZADO tambem entra por `@Input`, e pela mesma razao mais uma: quem
 * inclui o componente ja sabe o escopo (team_id, email, intervalo) e ja pede
 * `daily-finished-stats`. Duplicar aqui a resolucao de escopo seria copiar a
 * parte mais fragil do painel de equipa.
 *
 * SEM `dailyRows` o componente NAO renderiza. Nao ha modo mock: antes de
 * 2026-08-04 o realizado vinha de um fixture, e um medidor de meta com
 * realizado inventado le-se como medicao, nao como maquete.
 */
@Component({
  selector: 'c4u-weekly-goal-breakdown',
  templateUrl: './c4u-weekly-goal-breakdown.component.html',
  styleUrls: ['./c4u-weekly-goal-breakdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C4uWeeklyGoalBreakdownComponent implements OnChanges {
  /** Meta de pontos do mes. Mesmo valor do anel de pontos ao lado. */
  @Input() monthTarget = 0;

  /**
   * Serie diaria de `GET /game/reports/team/daily-finished-stats`.
   * `null` = sem fonte de realizado; o componente esconde-se.
   */
  @Input() dailyRows: readonly WeeklyGoalDailyRow[] | null = null;

  /** Mes de referencia, para descartar dias fora dele. */
  @Input() monthRef: Date | string | null = null;

  @Input() isLoading = false;
  @Input() label = 'Meta por semana';

  /**
   * Oculto em todos os paineis enquanto o bloco nao volta a ser prioridade.
   * Religue para `true` para reexibir sem mexer nos templates.
   */
  readonly isEnabled = false;

  slices: WeeklyGoalSlice[] = [];

  constructor(private weeklyGoal: WeeklyGoalService) {}

  /**
   * Sem isto o host vazio ainda entra na grade CSS e abre um buraco
   * entre "Pontos no mes" e "Entregas no prazo".
   */
  @HostBinding('style.display')
  get hostDisplay(): 'none' | 'block' {
    return this.isEnabled ? 'block' : 'none';
  }

  /** Ha fonte de realizado? Sem ela nao se mostra nada. */
  get hasAchievedSource(): boolean {
    return this.isEnabled && this.dailyRows !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // OnPush sem subscribe assincrono: `ngOnChanges` corre dentro da deteccao
    // de mudanca do pai, entao nao e preciso `markForCheck` — foi o subscribe
    // que o exigia na versao anterior, e cuja falta congelou os cartoes de
    // economia no esqueleto.
    if (changes['monthTarget'] || changes['dailyRows'] || changes['monthRef']) {
      this.rebuild();
    }
  }

  trackByWeek(_index: number, slice: WeeklyGoalSlice): number {
    return slice.week;
  }

  private rebuild(): void {
    if (!this.hasAchievedSource) {
      this.slices = [];
      return;
    }
    const achieved = this.weeklyGoal.bucketDailyRows(this.dailyRows, this.monthRef);
    this.slices = this.weeklyGoal.buildSlices(this.monthTarget, achieved);
  }
}
