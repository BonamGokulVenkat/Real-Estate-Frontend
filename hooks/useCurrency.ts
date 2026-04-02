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

  // Returns the raw converted price in the selected currency
  const getConvertedPrice = (priceInINR: number) => {
    if (!priceInINR || isNaN(priceInINR) || !isFinite(priceInINR)) {
      return 0;
    }

    const rate = rates[currency] || 1;

    let converted = priceInINR * rate;

    // 🔥 fix floating precision
    converted = Number(converted.toFixed(2));

    // 🚨 prevent insane values
    if (converted > 1e15) {
      console.warn("Overflow detected:", converted);
      return 0;
    }

    return converted;
  };

  // Formats price from base INR to selected currency
 const formatPrice = (priceInINR: number) => {
  const convertedPrice = getConvertedPrice(priceInINR);

  if (!convertedPrice) return "₹0";

  if (currency === 'INR') {
    if (convertedPrice >= 1e7)
      return `₹${(convertedPrice / 1e7).toFixed(2)} Cr`;

    if (convertedPrice >= 1e5)
      return `₹${(convertedPrice / 1e5).toFixed(2)} L`;

    return `₹${Math.round(convertedPrice).toLocaleString('en-IN')}`;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  if (['USD', 'EUR', 'GBP'].includes(currency)) {
    if (convertedPrice >= 1e6)
      return `${formatter.format(convertedPrice / 1e6)}M`;

    if (convertedPrice >= 1e3)
      return `${formatter.format(convertedPrice / 1e3)}k`;
  }

  return formatter.format(convertedPrice);
};

  return { currency, setCurrency, formatPrice, rates, getConvertedPrice };
};
