import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

interface CurrencyState {
  currency: CurrencyCode;
  rates: Record<string, number>;
  setCurrency: (currency: CurrencyCode) => void;
  setRates: (rates: Record<string, number>) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'INR',
      rates: { INR: 1 }, // Default, will be updated by hook
      setCurrency: (currency) => set({ currency }),
      setRates: (rates) => set({ rates }),
    }),
    {
      name: 'currency-storage',
    }
  )
);
