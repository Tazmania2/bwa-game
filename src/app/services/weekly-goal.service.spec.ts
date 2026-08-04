import { WeeklyGoalService, WEEKLY_GOAL_WEIGHTS } from './weekly-goal.service';

describe('WeeklyGoalService', () => {
  let service: WeeklyGoalService;

  beforeEach(() => {
    service = new WeeklyGoalService();
  });

  describe('weekBucketForDayOfMonth', () => {
    it('maps days 1-7 to week 1 and 8-14 to week 2', () => {
      expect(WeeklyGoalService.weekBucketForDayOfMonth(1)).toBe(1);
      expect(WeeklyGoalService.weekBucketForDayOfMonth(7)).toBe(1);
      expect(WeeklyGoalService.weekBucketForDayOfMonth(8)).toBe(2);
      expect(WeeklyGoalService.weekBucketForDayOfMonth(14)).toBe(2);
      expect(WeeklyGoalService.weekBucketForDayOfMonth(15)).toBe(3);
      expect(WeeklyGoalService.weekBucketForDayOfMonth(21)).toBe(3);
      expect(WeeklyGoalService.weekBucketForDayOfMonth(22)).toBe(4);
    });

    // A regressao que motivou a funcao: um mes tem sempre mais de 28 dias e a
    // versao anterior descartava tudo o que caisse depois da 4a semana.
    it('absorbs the month tail into week 4 instead of inventing a week 5', () => {
      expect(WeeklyGoalService.weekBucketForDayOfMonth(28)).toBe(4);
      expect(WeeklyGoalService.weekBucketForDayOfMonth(29)).toBe(4);
      expect(WeeklyGoalService.weekBucketForDayOfMonth(31)).toBe(4);
    });
  });

  describe('bucketDailyRows', () => {
    it('sums points into the four buckets', () => {
      const rows = service.bucketDailyRows([
        { day: '2026-08-03', points_sum: 100 },
        { day: '2026-08-06', points_sum: 20 },
        { day: '2026-08-11', points_sum: 50 },
        { day: '2026-08-17', points_sum: 70 },
        { day: '2026-08-25', points_sum: 90 },
      ]);

      expect(rows).toEqual([
        { week: 1, achieved_points: 120 },
        { week: 2, achieved_points: 50 },
        { week: 3, achieved_points: 70 },
        { week: 4, achieved_points: 90 },
      ]);
    });

    it('keeps points from days 29-31 instead of dropping them', () => {
      const rows = service.bucketDailyRows([
        { day: '2026-08-22', points_sum: 10 },
        { day: '2026-08-31', points_sum: 5 },
      ]);

      expect(rows[3]).toEqual({ week: 4, achieved_points: 15 });
      const total = rows.reduce((sum, row) => sum + row.achieved_points, 0);
      expect(total).toBe(15);
    });

    it('always returns exactly four buckets, zeroed when there is no data', () => {
      const rows = service.bucketDailyRows([]);
      expect(rows).toHaveSize(WEEKLY_GOAL_WEIGHTS.length);
      expect(rows.every(row => row.achieved_points === 0)).toBe(true);
    });

    it('discards days outside the reference month', () => {
      const rows = service.bucketDailyRows(
        [
          { day: '2026-07-31', points_sum: 999 },
          { day: '2026-08-02', points_sum: 40 },
          { day: '2026-09-01', points_sum: 777 },
        ],
        '2026-08-01',
      );

      expect(rows[0]).toEqual({ week: 1, achieved_points: 40 });
      expect(rows.reduce((sum, row) => sum + row.achieved_points, 0)).toBe(40);
    });

    // `new Date('2026-08-01')` e UTC; em America/Sao_Paulo `getDate()` daria 31
    // de julho e o ponto saia do mes. Por isso a data e lida do texto.
    it('reads the first of the month as day 1 regardless of timezone', () => {
      const rows = service.bucketDailyRows(
        [{ day: '2026-08-01T00:00:00.000Z', points_sum: 33 }],
        new Date(2026, 7, 15),
      );

      expect(rows[0]).toEqual({ week: 1, achieved_points: 33 });
    });

    it('ignores malformed days, missing points and negative values', () => {
      const rows = service.bucketDailyRows([
        { day: 'nao-e-data', points_sum: 500 },
        { day: '2026-08-05' },
        { day: '2026-08-06', points_sum: -10 },
        { day: '2026-08-07', points_sum: 25 },
      ]);

      expect(rows[0]).toEqual({ week: 1, achieved_points: 25 });
    });
  });

  describe('buildSlices', () => {
    it('splits the month target 10/20/20/50', () => {
      const slices = service.buildSlices(1000, []);

      expect(slices.map(s => s.weightPct)).toEqual([10, 20, 20, 50]);
      expect(slices.map(s => s.targetPoints)).toEqual([100, 200, 200, 500]);
    });

    // O resto vai para a ultima semana de proposito: arredondar cada semana
    // isoladamente deixaria a soma diferente da meta do mes.
    it('makes the weekly targets sum exactly to the month target', () => {
      for (const target of [1, 7, 33, 101, 999, 12345]) {
        const total = service
          .buildSlices(target, [])
          .reduce((sum, slice) => sum + slice.targetPoints, 0);
        expect(total).toBe(target);
      }
    });

    it('caps progress at 100 percent and never goes negative', () => {
      const slices = service.buildSlices(1000, [
        { week: 1, achieved_points: 400 },
        { week: 2, achieved_points: 0 },
        { week: 3, achieved_points: 0 },
        { week: 4, achieved_points: 0 },
      ]);

      expect(slices[0].achievedPoints).toBe(400);
      expect(slices[0].progressPct).toBe(100);
      expect(slices[1].progressPct).toBe(0);
    });

    it('returns zeroed targets when the month target is absent or invalid', () => {
      for (const target of [0, -50, Number.NaN]) {
        const slices = service.buildSlices(target, []);
        expect(slices.every(slice => slice.targetPoints === 0)).toBe(true);
        expect(slices.every(slice => slice.progressPct === 0)).toBe(true);
      }
    });
  });
});
