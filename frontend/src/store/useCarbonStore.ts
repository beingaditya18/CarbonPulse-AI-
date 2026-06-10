/**
 * @fileoverview CarbonPulse Global State Store
 * Zustand store with persistence for all carbon tracking data.
 * Handles emissions logs, user profile, achievements,
 * and community data.
 * @module useCarbonStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CarbonStore } from '@/types/store';
import { createUserSlice } from './slices/userSlice';
import { createEmissionsSlice } from './slices/emissionsSlice';
import { createAchievementsSlice } from './slices/achievementsSlice';
import { createCommunitySlice } from './slices/communitySlice';
import { DEFAULT_USER, INITIAL_CHALLENGES, INITIAL_BADGES } from '@/constants/initialState';

/**
 * Zustand global store containing the user state, logs, chat coach history, and achievements.
 * Composes domain slices and synchronizes state with localStorage.
 */
export const useCarbonStore = create<CarbonStore>()(
  persist(
    (...args) => ({
      ...createUserSlice(...args),
      ...createEmissionsSlice(...args),
      ...createAchievementsSlice(...args),
      ...createCommunitySlice(...args),

      resetStore: () => {
        const [set] = args;
        set({
          user: DEFAULT_USER,
          logs: [],
          chatHistory: [
            {
              id: 'initial',
              role: 'assistant',
              content: 'Hello! I am your AI Climate Coach. I can help analyze your carbon logs, suggest personalized reduction targets, and guide you through challenges. Ask me anything about how to cut your emissions!',
              timestamp: new Date().toISOString(),
            },
          ],
          challenges: INITIAL_CHALLENGES.map((c) => ({ ...c, status: 'pending' as const })),
          badges: INITIAL_BADGES.map((b) => ({ ...b, unlocked: false })),
        });
      },
    }),
    {
      name: 'carbonpulse-store',
    }
  )
);
