import { create } from 'zustand';

import type { PriceSimulationResponse } from '@/types/priceSimulation';

interface SimulationState {
  result?: PriceSimulationResponse;
  loading: boolean;
  error?: string;
  setLoading: (loading: boolean) => void;
  setResult: (result?: PriceSimulationResponse) => void;
  setError: (message?: string) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  result: undefined,
  loading: false,
  error: undefined,
  setLoading: (loading) => set({ loading }),
  setResult: (result) => set({ result, error: undefined }),
  setError: (message) => set({ error: message, loading: false }),
  reset: () => set({ result: undefined, error: undefined, loading: false }),
}));
