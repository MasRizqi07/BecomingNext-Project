import { create } from 'zustand';
import { User } from 'firebase/auth';

interface BecomingState {
  user: User | null;
  step: 'landing' | 'intake' | 'analysis' | 'results';
  responses: Record<string, string>;
  analysis: any | null;
  setUser: (user: User | null) => void;
  setStep: (step: BecomingState['step']) => void;
  setResponse: (question: string, answer: string) => void;
  resetResponses: () => void;
  setAnalysis: (analysis: any) => void;
}

export const useBecomingStore = create<BecomingState>((set) => ({
  user: null,
  step: 'landing',
  responses: {},
  analysis: null,
  setUser: (user) => set({ user }),
  setStep: (step) => set({ step }),
  setResponse: (question, answer) => 
    set((state) => ({ 
      responses: { ...state.responses, [question]: answer } 
    })),
  resetResponses: () => set({ responses: {} }),
  setAnalysis: (analysis) => set({ analysis }),
}));
