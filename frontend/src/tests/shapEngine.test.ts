import { describe, it, expect } from 'vitest';
import { calculateSHAPExplanations } from '@/lib/shapEngine';
import { CarbonLog } from '@/types/store';

describe('SHAP Explanation Engine', () => {
  it('correctly calculates baseline and shap values for empty logs', () => {
    const logs: CarbonLog[] = [];
    const result = calculateSHAPExplanations(logs);

    expect(result.baseValue).toBe(283);
    expect(result.predictedEmissions).toBe(0);
    expect(result.explanations.length).toBeGreaterThan(0);
  });

  it('correctly attributes higher transport emissions', () => {
    const logs: CarbonLog[] = [
      {
        id: '1',
        category: 'transportation',
        emission_amount: 150,
        source: 'manual',
        description: 'Drive',
        logged_date: new Date().toISOString(),
      },
    ];

    const result = calculateSHAPExplanations(logs);
    const transportExp = result.explanations.find((e) => e.feature === 'Transportation');

    expect(transportExp).toBeDefined();
    // Transportation should drive emissions higher
    expect(transportExp?.direction).toBe('higher');
  });
});
