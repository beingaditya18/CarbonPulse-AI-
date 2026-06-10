import { describe, it, expect } from 'vitest';
import { simulateTwinEmissions } from '@/lib/twinRegression';
import { CarbonLog } from '@/types/store';

describe('Carbon Twin Regression Simulator', () => {
  const mockLogs: CarbonLog[] = [
    { id: '1', category: 'transportation', emission_amount: 40, source: 'manual', description: 'Drive', logged_date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: '2', category: 'electricity', emission_amount: 80, source: 'manual', description: 'Power', logged_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: '3', category: 'food', emission_amount: 10, source: 'manual', description: 'Meal', logged_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
  ];

  it('correctly models baseline and yields reduction savings', () => {
    // Simulate 30-day scope reducing transportation by 50%
    const result = simulateTwinEmissions(mockLogs, 'transportation', 50, 30);

    expect(result.baselineProjected).toBeGreaterThan(0);
    expect(result.simulatedProjected).toBeLessThan(result.baselineProjected);
    expect(result.carbonSaved).toBeCloseTo(result.baselineProjected - result.simulatedProjected, 1);
  });
});
