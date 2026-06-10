import { describe, test, expect } from 'vitest';
import { calculateShapValues } from '@/lib/shapEngine';

const baseline = {
  transport: 100,
  food: 50,
  electricity: 80,
};

const exactBaselineEmissions = [
  { category: 'transport', value: 100 },
  { category: 'food', value: 50 },
  { category: 'electricity', value: 80 },
];

const zeroEmissions = [
  { category: 'transport', value: 0 },
  { category: 'food', value: 0 },
  { category: 'electricity', value: 0 },
];

const userEmissions = [
  { category: 'transport', value: 150 },
  { category: 'food', value: 70 },
  { category: 'electricity', value: 60 },
];

const expectedTotalDeviation = (150 + 70 + 60) - (100 + 50 + 80); // 280 - 230 = 50

describe('SHAP Engine — Edge Cases', () => {

  test('throws on empty emissions array', () => {
    expect(() => calculateShapValues([], baseline))
      .toThrow('Insufficient data');
  });

  test('handles single category correctly', () => {
    const result = calculateShapValues(
      [{ category: 'transport', value: 120 }],
      baseline
    );
    expect(result).toHaveLength(1);
    expect(result[0].contribution).toBeDefined();
  });

  test('returns zero contribution when equal to baseline', () => {
    const result = calculateShapValues(
      exactBaselineEmissions,
      baseline
    );
    result.forEach(r => expect(r.contribution).toBe(0));
  });

  test('handles all-zero emissions without NaN', () => {
    const result = calculateShapValues(zeroEmissions, baseline);
    result.forEach(r => {
      expect(r.contribution).not.toBeNaN();
      expect(isFinite(r.contribution)).toBe(true);
    });
  });

  test('contributions sum matches total deviation', () => {
    const result = calculateShapValues(userEmissions, baseline);
    const sum = result.reduce((a, b) => a + b.contribution, 0);
    expect(sum).toBeCloseTo(expectedTotalDeviation, 2);
  });
});
