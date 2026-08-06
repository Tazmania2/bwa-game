import { EconomyIndicator, EconomyIndicatorsService } from './economy-indicators.service';

const indicator = (mtd: number, prev: number | null): EconomyIndicator => ({
  id: 'cost_per_delivery',
  label: 'Custo por entrega',
  mtd_value: mtd,
  prev_mtd_value: prev,
});

describe('EconomyIndicatorsService', () => {
  describe('deltaPct', () => {
    it('computes the variation against the previous month', () => {
      expect(EconomyIndicatorsService.deltaPct(indicator(12, 10))).toBeCloseTo(20, 5);
      expect(EconomyIndicatorsService.deltaPct(indicator(8, 10))).toBeCloseTo(-20, 5);
    });

    // Sem base nao existe percentual. Mostrar 0% ou infinito seria mentira.
    it('returns null when there is no comparable previous month', () => {
      expect(EconomyIndicatorsService.deltaPct(indicator(12, null))).toBeNull();
      expect(EconomyIndicatorsService.deltaPct(indicator(12, 0))).toBeNull();
    });
  });

  describe('deltaTone', () => {
    // O ponto inteiro deste teste: estes cartoes mostram CUSTO, entao subir e
    // mau. Um pill verde num custo que subiu engana quem le depressa, e e o
    // erro mais facil de cometer ao reaproveitar o tom dos KPIs operacionais.
    it('is inverted relative to operational KPIs: a rising cost is negative', () => {
      expect(EconomyIndicatorsService.deltaTone(indicator(12, 10))).toBe('negative');
    });

    it('treats a falling cost as positive', () => {
      expect(EconomyIndicatorsService.deltaTone(indicator(8, 10))).toBe('positive');
    });

    it('is neutral without a base or when the movement is negligible', () => {
      expect(EconomyIndicatorsService.deltaTone(indicator(12, null))).toBe('neutral');
      expect(EconomyIndicatorsService.deltaTone(indicator(10.0001, 10))).toBe('neutral');
    });
  });
});
