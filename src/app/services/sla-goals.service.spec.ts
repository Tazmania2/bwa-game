import { SlaGoalsService } from './sla-goals.service';

describe('SlaGoalsService', () => {
  const service = new SlaGoalsService();

  it('uses API goal as both meta and supermeta', () => {
    const kpis = service.toKpiData(
      {
        g4: { current: 100, goal: 100 },
        onboarding: { current: 0, goal: 100 },
        riscoDeChurn: { current: 98.39, goal: 100 }
      },
      (current, target, superTarget) => {
        if (current >= superTarget) {
          return 'green';
        }
        if (current >= target) {
          return 'yellow';
        }
        return 'red';
      }
    );

    expect(kpis.map(k => k.id)).toEqual(['on-time-g4', 'on-time-onboarding', 'on-time-risco']);
    expect(kpis[0].current).toBe(100);
    expect(kpis[0].target).toBe(100);
    expect(kpis[0].superTarget).toBe(100);
    expect(kpis[0].color).toBe('green');
    expect(kpis[1].current).toBe(0);
    expect(kpis[1].color).toBe('red');
    expect(kpis[2].color).toBe('red');
  });

  it('falls back to 100 when goal is absent', () => {
    const kpis = service.toKpiData(
      {
        g4: { current: 91.4, goal: null },
        onboarding: { current: 86.2, goal: null },
        riscoDeChurn: { current: 98.1, goal: null }
      },
      () => 'red'
    );
    expect(kpis.every(k => k.target === 100 && k.superTarget === 100)).toBeTrue();
  });

  it('marks missing API values without inventing a measurement', () => {
    const kpis = service.toKpiData(null, () => 'red');
    expect(kpis.every(k => k.isMissing && k.color === 'gray')).toBeTrue();
    expect(kpis.every(k => k.current === 0)).toBeTrue();
    expect(kpis.every(k => !k.isDisabled)).toBeTrue();
  });

  it('disables a segment when hasPending is false', () => {
    const kpis = service.toKpiData(
      {
        g4: { current: 100, goal: 100, hasPending: false },
        onboarding: { current: 80, goal: 100, hasPending: true },
        riscoDeChurn: { current: null, goal: 100, hasPending: false }
      },
      () => 'green'
    );
    expect(kpis[0].isDisabled).toBeTrue();
    expect(kpis[0].isMissing).toBeFalse();
    expect(kpis[0].color).toBe('gray');
    expect(kpis[1].isDisabled).toBeFalsy();
    expect(kpis[1].color).toBe('green');
    expect(kpis[2].isDisabled).toBeTrue();
    expect(kpis[2].isMissing).toBeFalse();
  });
});
