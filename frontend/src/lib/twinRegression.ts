import { CarbonLog, CategoryType } from '../types/store';

export interface SimulationResult {
  baselineProjected: number; // Projected kg CO2 without change
  simulatedProjected: number; // Projected kg CO2 with scenario change
  carbonSaved: number; // kg CO2 saved
  scenarioDescription: string;
}

/**
 * Fits a simple linear regression trendline on the user's daily emission totals
 * and forecasts the carbon trajectory over the next N days.
 * 
 * Then applies scenario reduction factor:
 * reduction_factor = (category_total / overall_total) * (reduction_percentage / 100)
 */
export function simulateTwinEmissions(
  logs: CarbonLog[],
  categoryToReduce: CategoryType,
  reductionPercentage: number,
  daysToSimulate: number
): SimulationResult {
  if (logs.length === 0) {
    return {
      baselineProjected: 0,
      simulatedProjected: 0,
      carbonSaved: 0,
      scenarioDescription: 'No historical carbon logs found to model.',
    };
  }

  // Group logs by day
  const dailyMap: Map<string, number> = new Map();
  const categoryTotalMap: Record<CategoryType, number> = {
    transportation: 0,
    electricity: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };
  let overallTotal = 0;

  logs.forEach((log) => {
    // Add to category totals
    categoryTotalMap[log.category] += log.emission_amount;
    overallTotal += log.emission_amount;

    // Add to daily maps
    const dateStr = log.logged_date.split('T')[0];
    const dailySum = dailyMap.get(dateStr) || 0;
    dailyMap.set(dateStr, dailySum + log.emission_amount);
  });

  const uniqueDays = Array.from(dailyMap.keys()).sort();
  
  // Fallback if we have fewer than 3 unique days of tracking
  if (uniqueDays.length < 3) {
    // Standard daily average
    const daysTracked = Math.max(1, uniqueDays.length);
    const dailyAvg = overallTotal / daysTracked;
    const baselineProjected = Math.round((dailyAvg * daysToSimulate) * 10) / 10;
    
    // Proportional category reduction
    const categoryRatio = overallTotal > 0 ? categoryTotalMap[categoryToReduce] / overallTotal : 0.2;
    const reductionFactor = categoryRatio * (reductionPercentage / 100);
    const simulatedProjected = Math.round((baselineProjected * (1.0 - reductionFactor)) * 10) / 10;
    const carbonSaved = Math.round((baselineProjected - simulatedProjected) * 10) / 10;

    return {
      baselineProjected,
      simulatedProjected,
      carbonSaved,
      scenarioDescription: `Proportional Model (Seed): Reduced ${categoryToReduce} by ${reductionPercentage}% over ${daysToSimulate} days.`,
    };
  }

  // Calculate day indices from the earliest log
  const startMs = new Date(uniqueDays[0]).getTime();
  const dataPoints: { x: number; y: number }[] = uniqueDays.map((dateStr) => {
    const dayIndex = Math.round((new Date(dateStr).getTime() - startMs) / (1000 * 60 * 60 * 24));
    return {
      x: dayIndex,
      y: dailyMap.get(dateStr) || 0,
    };
  });

  // Fit linear regression y = mx + c using Least Squares
  const N = dataPoints.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  dataPoints.forEach((pt) => {
    sumX += pt.x;
    sumY += pt.y;
    sumXY += pt.x * pt.y;
    sumXX += pt.x * pt.x;
  });

  const denominator = N * sumXX - sumX * sumX;
  let slope = 0;
  let intercept = sumY / N;

  if (Math.abs(denominator) > 0.0001) {
    slope = (N * sumXY - sumX * sumY) / denominator;
    intercept = (sumY - slope * sumX) / N;
  }

  // Extrapolate baseline totals for the next daysToSimulate
  const lastDayIndex = dataPoints[dataPoints.length - 1].x;
  let baselineProjected = 0;

  for (let i = 1; i <= daysToSimulate; i++) {
    const futureDay = lastDayIndex + i;
    const dayEmission = Math.max(0, slope * futureDay + intercept);
    baselineProjected += dayEmission;
  }

  baselineProjected = Math.round(baselineProjected * 10) / 10;

  // Apply scenario reduction factor
  const catShare = overallTotal > 0 ? categoryTotalMap[categoryToReduce] / overallTotal : 0;
  const reductionFactor = catShare * (reductionPercentage / 100);
  const simulatedProjected = Math.round((baselineProjected * (1.0 - reductionFactor)) * 10) / 10;
  const carbonSaved = Math.round((baselineProjected - simulatedProjected) * 10) / 10;

  return {
    baselineProjected,
    simulatedProjected,
    carbonSaved,
    scenarioDescription: `Trend Forecasting: Fitted slope of ${slope.toFixed(2)} kg/day. Simulated ${reductionPercentage}% cut in ${categoryToReduce}.`,
  };
}
