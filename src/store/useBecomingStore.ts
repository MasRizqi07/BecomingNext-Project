import type {User} from 'firebase/auth';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import type {AnalysisResult, ReflectionQuestionId, ReflectionResponses} from '@shared/contracts';

interface BecomingState {
  user: User | null;
  authReady: boolean;
  responses: Partial<ReflectionResponses>;
  currentQuestionIndex: number;
  activeAnalysisId: string | null;
  analysis: AnalysisResult | null;
  setAuth: (user: User | null) => void;
  setResponse: (question: ReflectionQuestionId, answer: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setActiveAnalysisId: (analysisId: string | null) => void;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  resetReflection: () => void;
}

export const useBecomingStore = create<BecomingState>()(
  persist(
    (set) => ({
      user: null,
      authReady: false,
      responses: {},
      currentQuestionIndex: 0,
      activeAnalysisId: null,
      analysis: null,
      setAuth: (user) => set({user, authReady: true}),
      setResponse: (question, answer) =>
        set((state) => ({responses: {...state.responses, [question]: answer}})),
      setCurrentQuestionIndex: (currentQuestionIndex) => set({currentQuestionIndex}),
      setActiveAnalysisId: (activeAnalysisId) => set({activeAnalysisId}),
      setAnalysis: (analysis) => set({analysis}),
      resetReflection: () =>
        set({responses: {}, currentQuestionIndex: 0, activeAnalysisId: null, analysis: null}),
    }),
    {
      name: 'becoming-session-v1',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        responses: state.responses,
        currentQuestionIndex: state.currentQuestionIndex,
        activeAnalysisId: state.activeAnalysisId,
        analysis: state.analysis,
      }),
    },
  ),
);
