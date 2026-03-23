import { useEffect } from 'react';
import { useCurrencyStore, CurrencyCode } from '@/store/useCurrencyStore';
import axios from 'axios';

export const useCurrency = () => {
  const { currency, setCurrency, rates, setRates } = useCurrencyStore();

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Fallback static rates if API fails to avoid breaking UI structure
        const staticRates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044 };
        
        try {
          // Using a free open API for exhange rates with INR as base
          const response = await axios.get('https://open.er-api.com/v6/latest/INR');
          if (response.data && response.data.rates) {
            setRates(response.data.rates);
          } else {
            setRates(staticRates);
          }
        } catch (e) {
          setRates(staticRates);
        }
      } catch (error) {
        console.error('Failed to fetch currency rates', error);
      }
    };

    fetchRates();
    // Refresh rates every hour
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, [setRates]);

  // Formats price from base INR to selected currency
  const formatPrice = (priceInINR: number) => {
    const rate = rates[currency] || 1;
    const convertedPrice = priceInINR * rate;

    // Formatting rules based on currency logic
    if (currency === 'INR') {
      if (convertedPrice >= 10000000) return `₹${(convertedPrice / 10000000).toFixed(2)} Cr`;
      if (convertedPrice >= 100000) return `₹${(convertedPrice / 100000).toFixed(2)} L`;
      return `₹${convertedPrice.toLocaleString('en-IN')}`;
    }

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });

    if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
      if (convertedPrice >= 1000000) return `${formatter.format(convertedPrice / 1000000)}M`;
      if (convertedPrice >= 1000) return `${formatter.format(convertedPrice / 1000)}k`;
    }

    return formatter.format(convertedPrice);
  };

  return { currency, setCurrency, formatPrice, rates };
};
