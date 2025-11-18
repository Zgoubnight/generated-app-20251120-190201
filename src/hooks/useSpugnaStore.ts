import { create } from 'zustand';
import { toast } from 'sonner';
import type { Member } from '@/components/spugna/constants';
import { MEMBERS } from '@/components/spugna/constants';
import type { SpugnaState as GameState } from '../../worker/app-controller';
type SpugnaView = 'login' | 'wheel' | 'results' | 'chart';
type SpugnaState = {
  currentUser: Member | null;
  currentView: SpugnaView;
  gameState: GameState | null;
  isLoading: boolean;
};
type SpugnaActions = {
  fetchGameState: () => Promise<void>;
  login: (userId: string) => void;
  logout: () => void;
  spinWheel: () => Promise<void>;
  showChart: () => void;
  backToWheel: () => void;
  performInitialDraw: () => Promise<void>;
  resetGlobalDraw: () => Promise<void>;
};
export const useSpugnaStore = create<SpugnaState & SpugnaActions>((set, get) => ({
  currentUser: null,
  currentView: 'login',
  gameState: null,
  isLoading: true,
  fetchGameState: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/spugna/state');
      if (!response.ok) throw new Error('Failed to fetch game state');
      const { data } = await response.json();
      set({ gameState: data, isLoading: false });
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion", { description: "Impossible de récupérer l'état du jeu." });
      set({ isLoading: false });
    }
  },
  login: (userId: string) => {
    const user = MEMBERS.find(m => m.id === userId);
    if (user) {
      const hasPlayed = get().gameState?.playersWhoPlayed[userId] ?? false;
      set({
        currentUser: user,
        currentView: hasPlayed ? 'results' : 'wheel',
      });
    }
  },
  logout: () => {
    set({
      currentUser: null,
      currentView: 'login',
    });
  },
  spinWheel: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/spugna/played/${currentUser.id}`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to mark as played');
      const { data } = await response.json();
      set({ gameState: data, currentView: 'results' });
    } catch (error) {
      console.error(error);
      toast.error("Erreur", { description: "Impossible de sauvegarder votre action." });
    }
  },
  showChart: () => set({ currentView: 'chart' }),
  backToWheel: () => {
    const { currentUser, gameState } = get();
    const hasPlayed = currentUser ? gameState?.playersWhoPlayed[currentUser.id] ?? false : false;
    set({ currentView: hasPlayed ? 'results' : 'wheel' });
  },
  performInitialDraw: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/spugna/draw', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to perform draw');
      const { data } = await response.json();
      set({ gameState: data, isLoading: false });
      toast.success("Tirage Global Effectué!", {
        description: "Les joueurs peuvent maintenant découvrir leurs résultats.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erreur de Tirage", { description: "L'algorithme n'a pas pu trouver de solution." });
      set({ isLoading: false });
    }
  },
  resetGlobalDraw: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/spugna/reset', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to reset draw');
      const { data } = await response.json();
      set(state => ({
        gameState: data,
        isLoading: false,
        currentView: state.currentUser ? 'wheel' : 'login',
      }));
      toast.warning("Réinitialisation Globale!", {
        description: "Tous les tirages ont été annulés. Le jeu est réinitialisé.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erreur", { description: "Impossible de réinitialiser le jeu." });
      set({ isLoading: false });
    }
  },
}));