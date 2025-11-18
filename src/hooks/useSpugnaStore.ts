import { create } from 'zustand';
import type { Member } from '@/components/spugna/constants';
import { MEMBERS, MOCK_RESULTS } from '@/components/spugna/constants';
type SpugnaView = 'login' | 'wheel' | 'results' | 'chart';
type SpugnaState = {
  currentUser: Member | null;
  currentView: SpugnaView;
  hasPlayed: boolean;
  userResults: string[];
  playersWhoPlayed: Set<string>;
  isInitialDrawDone: boolean;
};
type SpugnaActions = {
  login: (userId: string) => void;
  logout: () => void;
  spinWheel: () => void;
  showChart: () => void;
  backToWheel: () => void;
  performInitialDraw: () => void;
  resetGlobalDraw: () => void;
};
export const useSpugnaStore = create<SpugnaState & SpugnaActions>((set, get) => ({
  currentUser: null,
  currentView: 'login',
  hasPlayed: false,
  userResults: [],
  playersWhoPlayed: new Set(),
  isInitialDrawDone: false, // Simulates that admin needs to run the draw first
  login: (userId: string) => {
    const user = MEMBERS.find(m => m.id === userId);
    if (user) {
      const hasPlayed = get().playersWhoPlayed.has(userId);
      set({
        currentUser: user,
        currentView: hasPlayed ? 'results' : 'wheel',
        hasPlayed: hasPlayed,
        userResults: hasPlayed ? MOCK_RESULTS[userId] || [] : [],
      });
    }
  },
  logout: () => {
    set({
      currentUser: null,
      currentView: 'login',
      hasPlayed: false,
      userResults: [],
    });
  },
  spinWheel: () => {
    const { currentUser, playersWhoPlayed } = get();
    if (currentUser) {
      const newPlayersWhoPlayed = new Set(playersWhoPlayed);
      newPlayersWhoPlayed.add(currentUser.id);
      set({
        currentView: 'results',
        hasPlayed: true,
        userResults: MOCK_RESULTS[currentUser.id] || [],
        playersWhoPlayed: newPlayersWhoPlayed,
      });
    }
  },
  showChart: () => set({ currentView: 'chart' }),
  backToWheel: () => set(state => ({ currentView: state.hasPlayed ? 'results' : 'wheel' })),
  performInitialDraw: () => {
    // In a real scenario, this would trigger a backend call.
    // Here, we just flip a flag to allow users to play.
    set({ isInitialDrawDone: true });
  },
  resetGlobalDraw: () => {
    // This is a global reset.
    set({
      isInitialDrawDone: false,
      playersWhoPlayed: new Set(),
      hasPlayed: false,
      userResults: [],
      currentView: get().currentUser ? 'wheel' : 'login',
    });
  },
}));