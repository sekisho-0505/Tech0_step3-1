import { create } from 'zustand';

import type { PriceSimulationResponse } from '@/types/priceSimulation';

interface SimulationInput {
  productName: string;
  unitCostPerKg: number;
  targetMarginRate: number;
  quantityKg?: number;
}

interface SimulationState {
  input?: SimulationInput;
  result?: PriceSimulationResponse;
  loading: boolean;
  error?: string;
  setInput: (input: SimulationInput) => void;
  setLoading: (loading: boolean) => void;
  setResult: (result?: PriceSimulationResponse) => void;
  setError: (message?: string) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  input: undefined,
  result: undefined,
  loading: false,
  error: undefined,
  setInput: (input) => set({ input }),
  setLoading: (loading) => set({ loading }),
  setResult: (result) => set({ result, error: undefined }),
  setError: (message) => set({ error: message, loading: false }),
  reset: () => set({ input: undefined, result: undefined, error: undefined, loading: false }),
}));
