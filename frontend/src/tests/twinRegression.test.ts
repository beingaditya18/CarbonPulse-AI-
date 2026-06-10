import { describe, test, expect } from 'vitest';
import { fitRegression, projectEmissions } from '@/lib/twinRegression';

const singlePoint = { x: 1, y: 10 };

const historicalData = [
  { x: 1, y: 10 },
  { x: 2, y: 12 },
  { x: 3, y: 15 },
  { x: 4, y: 18 },
  { x: 5, y: 22 },
];

const identicalDatesData = [
  { x: 1, y: 10 },
  { x: 1, y: 12 },
];

describe('Twin Regression — Edge Cases', () => {

  test('throws with fewer than 2 data points', () => {
    expect(() => fitRegression([singlePoint]))
      .toThrow();
  });

  test('handles identical x values without division by zero', () => {
    const model = fitRegression(identicalDatesData);
    expect(model.slope).not.toBeNaN();
    expect(isFinite(model.slope)).toBe(true);
  });

  test('projects correct 30-day baseline', () => {
    const model = fitRegression(historicalData);
    const projection = projectEmissions(model, 30);
    expect(projection.baseline).toHaveLength(30);
    expect(projection.baseline[0]).toBeGreaterThan(0);
  });

  test('scenario projection is less than baseline', () => {
    const model = fitRegression(historicalData);
    const projection = projectEmissions(model, 30, {
      transport: 0.2,
      food: 0.1
    });
    const baselineTotal = projection.baseline
      .reduce((a, b) => a + b, 0);
    const scenarioTotal = projection.simulated
      .reduce((a, b) => a + b, 0);
    expect(scenarioTotal).toBeLessThan(baselineTotal);
  });

  test('returns R² score between 0 and 1', () => {
    const model = fitRegression(historicalData);
    expect(model.rSquared).toBeGreaterThanOrEqual(0);
    expect(model.rSquared).toBeLessThanOrEqual(1);
  });
});
