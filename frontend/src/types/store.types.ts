/**
 * @fileoverview Zustand State Store interfaces
 */

import { CarbonLog, Challenge, Badge } from './carbon.types';

export interface UserProfile {
  name: string;
  email: string;
  onboardingComplete: boolean;
  ecoLevel: number;
  points: number;
  totalCarbonSaved: number;
  baselineEmissions: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

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
