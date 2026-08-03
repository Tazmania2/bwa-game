import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  EconomyIndicator,
  EconomyIndicatorsService,
} from '@app/services/economy-indicators.service';

/**
 * Cartoes de economia do dashboard organizacional (feature 10).
 *
 * Fica em SECAO PROPRIA, fora de "Indicadores principais", de proposito: os
 * cartoes hero mostram contagens operacionais e estes mostram reais. Misturar
 * unidades na mesma grade dilui a leitura de "Indicadores principais".
 *
 * Componente separado (e nao mais markup dentro de
 * organization-hierarchy-report.component.html, que ja tem 1.347 linhas) porque
 * a revisao arquitetural aberta na PR #78 aponta componentes-deus como o
 * problema estrutural do repo. Nao vale a pena pagar a decomposicao duas vezes.
 */
@Component({
  selector: 'c4u-org-economy-cards',
  templateUrl: './c4u-org-economy-cards.component.html',
  styleUrls: ['./c4u-org-economy-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C4uOrgEconomyCardsComponent implements OnInit, OnDestroy {
  indicators: EconomyIndicator[] = [];
  currency = 'BRL';
  isMock = true;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private economy: EconomyIndicatorsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.economy
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: payload => {
          this.indicators = payload.indicators;
          this.currency = payload.currency;
          this.isMock = payload.isMock;
          this.isLoading = false;
          // OBRIGATORIO com OnPush: a resposta chega fora de qualquer evento
          // que dispare deteccao de mudanca neste componente. Sem isto os
          // campos acima mudam na classe e a view fica no esqueleto para
          // sempre — foi exatamente o que aconteceu.
          this.cdr.markForCheck();
        },
        // `load()` ja converte falha em payload vazio, mas se algum erro
        // escapar o esqueleto nao pode ficar girando eternamente.
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  deltaPct(indicator: EconomyIndicator): number | null {
    return EconomyIndicatorsService.deltaPct(indicator);
  }

  deltaTone(indicator: EconomyIndicator): 'positive' | 'negative' | 'neutral' {
    return EconomyIndicatorsService.deltaTone(indicator);
  }

  /** Rotulo do delta ja com sinal. `—` quando nao ha mes anterior comparavel. */
  deltaLabel(indicator: EconomyIndicator): string {
    const pct = this.deltaPct(indicator);
    if (pct == null) {
      return '—';
    }
    const signal = pct > 0 ? '+' : '';
    return `${signal}${pct.toFixed(1).replace('.', ',')}%`;
  }

  trackById(_index: number, indicator: EconomyIndicator): string {
    return indicator.id;
  }
}
