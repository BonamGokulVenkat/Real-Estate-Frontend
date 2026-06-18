import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

interface CurrencyState {
  currency: CurrencyCode;
  rates: Record<string, number>;
  setCurrency: (currency: CurrencyCode) => void;
  setRates: (rates: Record<string, number>) => void;
}

const DEFAULT_RATES = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044 };

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'INR',
      rates: DEFAULT_RATES,
      setCurrency: (currency) => set({ currency }),
      setRates: (rates) => set({ rates }),
    }),
    {
      name: 'currency-storage',
      // Only persist the selected currency, not the rates
      // Rates are always freshly fetched on load via useCurrency hook
      partialize: (state) => ({ currency: state.currency }),
    }
  )
);