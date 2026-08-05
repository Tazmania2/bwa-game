import {
  EMPTY_ON_TIME_SEGMENT_PERCENTS,
  readOnTimePctNumber,
  readOnTimeSegmentPercents
} from './on-time-pct.util';

describe('on-time-pct.util', () => {
  describe('readOnTimePctNumber', () => {
    it('returns null for empty values', () => {
      expect(readOnTimePctNumber(null)).toBeNull();
      expect(readOnTimePctNumber(undefined)).toBeNull();
      expect(readOnTimePctNumber('')).toBeNull();
      expect(readOnTimePctNumber('  ')).toBeNull();
    });

    it('keeps 0–100 values and scales 0–1 fractions', () => {
      expect(readOnTimePctNumber(91.45)).toBe(91.45);
      expect(readOnTimePctNumber(0)).toBe(0);
      expect(readOnTimePctNumber(0.875)).toBe(87.5);
      expect(readOnTimePctNumber(1)).toBe(100);
    });
  });

  describe('readOnTimeSegmentPercents', () => {
    it('reads month_ contract fields for current and goal', () => {
      expect(
        readOnTimeSegmentPercents({
          month_on_time_pct_acessorias_g4: 100,
          month_on_time_pct_acessorias_onboarding: 0,
          month_on_time_pct_acessorias_risco_de_churn: 98.39,
          month_on_time_goal_pct_acessorias_g4: 100,
          month_on_time_goal_pct_acessorias_onboarding: 100,
          month_on_time_goal_pct_acessorias_risco_de_churn: 100
        })
      ).toEqual({
        g4: { current: 100, goal: 100, hasPending: true },
        onboarding: { current: 0, goal: 100, hasPending: true },
        riscoDeChurn: { current: 98.39, goal: 100, hasPending: true }
      });
    });

    it('reads month_has_pending flags and keeps true when absent', () => {
      expect(
        readOnTimeSegmentPercents({
          month_on_time_pct_acessorias_g4: 100,
          month_has_pending_acessorias_g4: false,
          month_has_pending_acessorias_onboarding: true,
          month_has_pending_acessorias_risco_de_churn: false
        })
      ).toEqual({
        g4: { current: 100, goal: null, hasPending: false },
        onboarding: { current: null, goal: null, hasPending: true },
        riscoDeChurn: { current: null, goal: null, hasPending: false }
      });
    });

    it('accepts unprefixed aliases', () => {
      expect(
        readOnTimeSegmentPercents({
          on_time_pct_acessorias_g4: 88,
          on_time_pct_acessorias_onboarding: 70,
          on_time_pct_acessorias_risco_de_churn: 99
        })
      ).toEqual({
        g4: { current: 88, goal: null, hasPending: true },
        onboarding: { current: 70, goal: null, hasPending: true },
        riscoDeChurn: { current: 99, goal: null, hasPending: true }
      });
    });

    it('returns empty percents when source has no segment fields', () => {
      expect(readOnTimeSegmentPercents({ month_on_time_delivery_pct: 90 })).toEqual(
        EMPTY_ON_TIME_SEGMENT_PERCENTS
      );
      expect(readOnTimeSegmentPercents(null)).toEqual(EMPTY_ON_TIME_SEGMENT_PERCENTS);
    });
  });
});
