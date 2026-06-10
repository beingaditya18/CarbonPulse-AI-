import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CarbonLog, CarbonStore } from '@/types/store';
import { INITIAL_CHALLENGES, INITIAL_BADGES, DEFAULT_USER } from '@/constants/initialState';
import { generateSeedLogs } from '@/utils/seedGenerator';

/**
 * Zustand global store containing the user state, logs, chat coach history, and achievements.
 * Automatically synchronizes with localStorage.
 */
export const useCarbonStore = create<CarbonStore>()(
  persist(
    (set, get) => ({
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
      challenges: INITIAL_CHALLENGES,
      badges: INITIAL_BADGES,

      setOnboarding: (answers) => {
        const baseline = 
          answers.energy * 2.5 + 
          answers.transit * 1.8 + 
          answers.diet * 1.2 + 
          answers.shopping * 1.5 + 
          answers.waste * 0.8;
          
        const baseVal = Math.round(Math.max(120, baseline) * 10) / 10;
        const seedLogs = generateSeedLogs();

        set({
          user: {
            name: answers.name,
            email: answers.email,
            onboardingComplete: true,
            ecoLevel: 1,
            points: 25, 
            totalCarbonSaved: 0,
            baselineEmissions: baseVal,
          },
          logs: seedLogs,
          badges: get().badges.map((b) => b.id === 'b-1' ? { ...b, unlocked: true } : b),
        });
      },

      addLog: (newLog) => {
        const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const logged_date = newLog.logged_date || new Date().toISOString();
        const logItem: CarbonLog = {
          ...newLog,
          id,
          logged_date,
        };

        const currentLogs = [logItem, ...get().logs];
        let pointsEarned = 10; 
        const updatedBadges = [...get().badges];

        // Check Badge 2: Log 5 carbon activities (excluding seeded)
        const userCreatedLogs = currentLogs.filter(l => !l.id.startsWith('seed-'));
        if (userCreatedLogs.length >= 5) {
          const b2 = updatedBadges.find(b => b.id === 'b-2');
          if (b2 && !b2.unlocked) {
            b2.unlocked = true;
            pointsEarned += 50;
          }
        }

        // Check Badge 3: Scan a receipt using AI OCR
        if (logItem.source === 'ocr') {
          const b3 = updatedBadges.find(b => b.id === 'b-3');
          if (b3 && !b3.unlocked) {
            b3.unlocked = true;
            pointsEarned += 100;
          }
        }

        const newPoints = get().user.points + pointsEarned;
        const newLevel = Math.floor(newPoints / 100) + 1;

        set({
          logs: currentLogs,
          user: {
            ...get().user,
            points: newPoints,
            ecoLevel: newLevel,
          },
          badges: updatedBadges,
        });

        return logItem;
      },

      deleteLog: (id) => {
        set({
          logs: get().logs.filter((log) => log.id !== id),
        });
      },

      updateLog: (id, updated) => {
        set({
          logs: get().logs.map((log) => (log.id === id ? { ...log, ...updated } : log)),
        });
      },

      acceptChallenge: (id) => {
        set({
          challenges: get().challenges.map((c) =>
            c.id === id ? { ...c, status: 'accepted' } : c
          ),
        });
      },

      completeChallenge: (id) => {
        let pointsEarned = 0;
        let carbonSaved = 0;
        const updatedChallenges = get().challenges.map((c) => {
          if (c.id === id) {
            pointsEarned = c.pointsReward;
            carbonSaved = c.potential_impact / 4; 
            return { ...c, status: 'completed' as const };
          }
          return c;
        });

        const updatedBadges = [...get().badges];
        const b5 = updatedBadges.find(b => b.id === 'b-5');
        if (b5 && !b5.unlocked) {
          b5.unlocked = true;
          pointsEarned += 100;
        }

        const newPoints = get().user.points + pointsEarned;
        const newLevel = Math.floor(newPoints / 100) + 1;

        const b6 = updatedBadges.find(b => b.id === 'b-6');
        if (b6 && !b6.unlocked && newPoints >= 500) {
          b6.unlocked = true;
        }

        set({
          challenges: updatedChallenges,
          user: {
            ...get().user,
            points: newPoints,
            ecoLevel: newLevel,
            totalCarbonSaved: get().user.totalCarbonSaved + carbonSaved,
          },
          badges: updatedBadges,
        });
      },

      addChatMessage: (role, content) => {
        set({
          chatHistory: [
            ...get().chatHistory,
            {
              id: `msg-${Date.now()}`,
              role,
              content,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      },

      clearChat: () => {
        set({
          chatHistory: [get().chatHistory[0]],
        });
      },

      resetStore: () => {
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
          challenges: INITIAL_CHALLENGES.map(c => ({ ...c, status: 'pending' })),
          badges: INITIAL_BADGES.map(b => ({ ...b, unlocked: false })),
        });
      },

      logout: () => {
        set({
          user: { ...DEFAULT_USER, onboardingComplete: false },
          logs: [],
          chatHistory: [
            {
              id: 'initial',
              role: 'assistant',
              content: 'Hello! I am your AI Climate Coach. I can help analyze your carbon logs, suggest personalized reduction targets, and guide you through challenges. Ask me anything about how to cut your emissions!',
              timestamp: new Date().toISOString(),
            },
          ],
          challenges: INITIAL_CHALLENGES.map(c => ({ ...c, status: 'pending' })),
          badges: INITIAL_BADGES.map(b => ({ ...b, unlocked: false })),
        });
      },
    }),
    {
      name: 'carbonpulse-store',
    }
  )
);
