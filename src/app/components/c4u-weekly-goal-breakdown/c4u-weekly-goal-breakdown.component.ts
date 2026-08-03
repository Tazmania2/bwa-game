import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { WeeklyGoalService, WeeklyGoalSlice } from '@app/services/weekly-goal.service';

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
 */
@Component({
  selector: 'c4u-weekly-goal-breakdown',
  templateUrl: './c4u-weekly-goal-breakdown.component.html',
  styleUrls: ['./c4u-weekly-goal-breakdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C4uWeeklyGoalBreakdownComponent implements OnInit, OnChanges, OnDestroy {
  /** Meta de pontos do mes. Mesmo valor do anel de pontos ao lado. */
  @Input() monthTarget = 0;
  @Input() isLoading = false;
  @Input() label = 'Meta por semana';

  slices: WeeklyGoalSlice[] = [];

  private achieved: { week: number; achieved_points: number }[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private weeklyGoal: WeeklyGoalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.weeklyGoal
      .loadAchieved()
      .pipe(takeUntil(this.destroy$))
      .subscribe(rows => {
        this.achieved = rows;
        this.rebuild();
        this.cdr.markForCheck();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthTarget']) {
      this.rebuild();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByWeek(_index: number, slice: WeeklyGoalSlice): number {
    return slice.week;
  }

  private rebuild(): void {
    this.slices = this.weeklyGoal.buildSlices(this.monthTarget, this.achieved);
  }
}
