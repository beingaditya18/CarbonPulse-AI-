/**
 * @fileoverview Carbon-related core types and interfaces.
 */

export type CategoryType = 'transportation' | 'food' | 'electricity' | 'shopping' | 'waste';

export interface CarbonLog {
  id: string;
  category: CategoryType;
  emission_amount: number;
  source: 'manual' | 'ocr';
  description: string;
  logged_date: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  potential_impact: number;
  category: CategoryType;
  status: 'pending' | 'accepted' | 'completed';
  pointsReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  pointsRequired: number;
  icon: string;
  unlocked: boolean;
}
