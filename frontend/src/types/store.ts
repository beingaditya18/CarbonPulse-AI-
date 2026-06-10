/**
 * Carbon activity categories.
 */
export type CategoryType = 'transportation' | 'food' | 'electricity' | 'shopping' | 'waste';

/**
 * Represents a single carbon emission activity logged by a user.
 */
export interface CarbonLog {
  id: string;
  category: CategoryType;
  emission_amount: number; // in kg CO2
  source: 'manual' | 'ocr';
  description: string;
  logged_date: string; // ISO String representation
}

/**
 * Represents a single message in the AI Climate Coach chat history.
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO String representation
}

/**
 * Represents a carbon reduction challenge available to users.
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  potential_impact: number; // kg CO2 saved per month
  category: CategoryType;
  status: 'pending' | 'accepted' | 'completed';
  pointsReward: number;
}

/**
 * Represents an achievement badge that can be unlocked.
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  pointsRequired: number;
  icon: string;
  unlocked: boolean;
}

/**
 * User profile variables and metrics.
 */
export interface UserProfile {
  name: string;
  email: string;
  onboardingComplete: boolean;
  ecoLevel: number;
  points: number;
  totalCarbonSaved: number; // in kg CO2
  baselineEmissions: number; // in kg CO2 per month
}

/**
 * Interface defining Zustand store operations and data states.
 */
export interface CarbonStore {
  user: UserProfile;
  logs: CarbonLog[];
  chatHistory: ChatMessage[];
  challenges: Challenge[];
  badges: Badge[];
  setOnboarding: (answers: {
    name: string;
    email: string;
    energy: number;
    transit: number;
    diet: number;
    shopping: number;
    waste: number;
  }) => void;
  addLog: (log: Omit<CarbonLog, 'id' | 'logged_date'> & { logged_date?: string }) => CarbonLog;
  deleteLog: (id: string) => void;
  updateLog: (id: string, updated: Partial<Omit<CarbonLog, 'id'>>) => void;
  acceptChallenge: (id: string) => void;
  completeChallenge: (id: string) => void;
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChat: () => void;
  resetStore: () => void;
  logout: () => void;
}
