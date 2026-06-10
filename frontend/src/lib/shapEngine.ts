import { CarbonLog, CategoryType } from '../types/store';

export interface SHAPExplanation {
  feature: string;
  impact: number; // percentage impact
  shapValue: number; // kg CO2 impact (positive or negative)
  direction: 'higher' | 'lower';
  description: string;
}

// Baseline average values representing a typical household footprint (kg CO2 / month)
export const BASELINE_DISTRIBUTION: Record<CategoryType, number> = {
  transportation: 80,
  electricity: 70,
  food: 40,
  shopping: 20,
  waste: 10,
};

// Expected baseline model output at average values
// Model: 1.2*T + 0.9*F + 1.5*E + 1.0*S + 1.0*W + 0.01*T*S
export const EXPECTED_BASE_VALUE = 283; 

/**
 * Calculates real-time SHAP values for a user's monthly emissions.
 * 
 * Demonstrates exact game-theoretic additive contributions:
 * Sum(SHAP values) = Predicted Footprint - Expected Baseline (283 kg CO2)
 */
export function calculateSHAPExplanations(logs: CarbonLog[]): {
  predictedEmissions: number;
  baseValue: number;
  explanations: SHAPExplanation[];
} {
  // Aggregate user's emissions in the last 30 days
  const userTotals: Record<CategoryType, number> = {
    transportation: 0,
    electricity: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter logs for the last 30 days
  const recentLogs = logs.filter((log) => {
    const logDate = new Date(log.logged_date);
    return logDate >= thirtyDaysAgo;
  });

  recentLogs.forEach((log) => {
    if (userTotals[log.category] !== undefined) {
      userTotals[log.category] += log.emission_amount;
    }
  });

  const T = userTotals.transportation;
  const E = userTotals.electricity;
  const F = userTotals.food;
  const S = userTotals.shopping;
  const W = userTotals.waste;

  // Calculate predicted total emissions using non-linear interaction model
  const predictedEmissions = Math.round((T * 1.2 + F * 0.9 + E * 1.5 + S + W + (T * S) * 0.01) * 10) / 10;

  // Compute SHAP values relative to standard averages
  // 104 is baseline transport contribution: 80 * 1.2 + 0.005 * 80 * 20 = 96 + 8 = 104
  const T_shap = T * 1.2 + 0.005 * T * S - 104;
  // 105 is baseline electricity contribution: 70 * 1.5 = 105
  const E_shap = E * 1.5 - 105;
  // 36 is baseline food contribution: 40 * 0.9 = 36
  const F_shap = F * 0.9 - 36;
  // 28 is baseline shopping contribution: 20 + 0.005 * 80 * 20 = 28
  const S_shap = S + 0.005 * T * S - 28;
  // 10 is baseline waste contribution: 10 * 1.0 = 10
  const W_shap = W - 10;

  const shapRaw: Record<CategoryType, number> = {
    transportation: T_shap,
    electricity: E_shap,
    food: F_shap,
    shopping: S_shap,
    waste: W_shap,
  };

  const totalAbsShap = Math.max(
    0.1,
    Object.values(shapRaw).reduce((sum, v) => sum + Math.abs(v), 0)
  );

  const explanations: SHAPExplanation[] = [];

  const categoryLabels: Record<CategoryType, string> = {
    transportation: 'Transportation',
    electricity: 'Electricity',
    food: 'Diet & Food',
    shopping: 'Shopping',
    waste: 'Waste & Garbage',
  };

  Object.entries(shapRaw).forEach(([catKey, value]) => {
    const category = catKey as CategoryType;
    const impactPercent = Math.round((Math.abs(value) / totalAbsShap) * 100);
    const direction = value > 0 ? 'higher' as const : 'lower' as const;
    const absVal = Math.round(Math.abs(value) * 10) / 10;

    let desc = '';
    if (direction === 'higher') {
      desc = `${categoryLabels[category]} consumption is driving your footprint higher than average, adding ${absVal} kg CO₂. Consider lowering your reliance in this area.`;
    } else {
      desc = `${categoryLabels[category]} practices are keeping your emissions lower than average, saving you ${absVal} kg CO₂. Outstanding work!`;
    }

    explanations.push({
      feature: categoryLabels[category],
      impact: impactPercent,
      shapValue: Math.round(value * 10) / 10,
      direction,
      description: desc,
    });
  });

  // Sort: Highest negative/positive absolute values first (highest impact)
  explanations.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  return {
    predictedEmissions,
    baseValue: EXPECTED_BASE_VALUE,
    explanations,
  };
}
