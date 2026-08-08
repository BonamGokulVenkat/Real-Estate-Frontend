import { useEffect } from 'react';
import { useCurrencyStore, CurrencyCode } from '@/store/useCurrencyStore';
import axios from 'axios';

export const useCurrency = () => {
  const { currency, setCurrency, rates, setRates } = useCurrencyStore();

  useEffect(() => {
    const fetchRates = async () => {
      const staticRates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044 };
      try {
        const response = await axios.get('https://open.er-api.com/v6/latest/INR');
        if (response.data?.rates) {
          setRates(response.data.rates);
        } else {
          setRates(staticRates);
        }
      } catch (e) {
        setRates(staticRates);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, [setRates]);

  const getConvertedPrice = (priceInINR: number): number => {
    if (!priceInINR || isNaN(priceInINR) || !isFinite(priceInINR)) return 0;
    const rate = rates[currency] ?? 1;
    const converted = Number((priceInINR * rate).toFixed(2));
    if (converted > 1e15) return 0;
    return converted;
  };

  const formatPrice = (priceInINR: string | number, options?: { ceil?: boolean }): string => {
    // Parse string to number
    const numeric = typeof priceInINR === 'string' ? Number(priceInINR) : priceInINR;

    // Return as-is if not a valid number (e.g. "Price on Request")
    if (isNaN(numeric) || !isFinite(numeric)) {
      return typeof priceInINR === 'string' ? priceInINR : '—';
    }

    const converted = getConvertedPrice(numeric);
    if (!converted) return '—';

    const shouldCeil = options?.ceil;

    // ── INR formatting ──
    if (currency === 'INR') {
      if (converted >= 1e7) {
        const val = converted / 1e7;
        return `₹${shouldCeil ? Math.ceil(val) : val.toFixed(2)} Cr`;
      }
      if (converted >= 1e5) {
        const val = converted / 1e5;
        return `₹${shouldCeil ? Math.ceil(val) : val.toFixed(2)} L`;
      }
      return `₹${(shouldCeil ? Math.ceil(converted) : Math.round(converted)).toLocaleString('en-IN')}`;
    }

    // ── AED formatting ──
    if (currency === 'AED') {
      if (converted >= 1e6) {
        const val = converted / 1e6;
        return `AED ${shouldCeil ? Math.ceil(val) : val.toFixed(2)}M`;
      }
      if (converted >= 1e3) {
        const val = converted / 1e3;
        return `AED ${shouldCeil ? Math.ceil(val) : val.toFixed(0)}K`;
      }
      return `AED ${(shouldCeil ? Math.ceil(converted) : Math.round(converted)).toLocaleString()}`;
    }

    // ── USD / EUR / GBP formatting ──
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] ?? currency;

    if (converted >= 1e6) {
      const val = converted / 1e6;
      return `${symbol}${shouldCeil ? Math.ceil(val) : val.toFixed(2)}M`;
    }
    if (converted >= 1e3) {
      const val = converted / 1e3;
      return `${symbol}${shouldCeil ? Math.ceil(val) : val.toFixed(0)}K`;
    }
    return `${symbol}${(shouldCeil ? Math.ceil(converted) : Math.round(converted)).toLocaleString()}`;
  };

  return { currency, setCurrency, formatPrice, rates, getConvertedPrice };
};