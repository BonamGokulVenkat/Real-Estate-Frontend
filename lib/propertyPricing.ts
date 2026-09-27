import { useCurrencyStore } from '@/store/useCurrencyStore';

export type PriceType = 'FIXED' | 'STARTING_FROM' | 'RANGE' | 'CONTACT_FOR_PRICE';
export type PriceCurrency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface PropertyPricing {
  price?: string | number | null;
  price_type?: PriceType | null;
  price_currency?: PriceCurrency | null;
  price_min?: string | null;
  price_max?: string | null;
}

const validAmount = /^(?:0|[1-9]\d{0,14})(?:\.\d{1,2})?$/;

export function normalizeEntryAmount(raw: string, currency: PriceCurrency, unit: 'amount' | 'lakh' | 'crore' = 'amount'): string {
  const text = raw.trim();
  if (!validAmount.test(text) || !/[1-9]/.test(text.replace('.', ''))) throw new Error('Enter a positive amount with at most two decimal places');
  if (unit !== 'amount' && currency !== 'INR') throw new Error('Lakh and crore are available only for INR');
  const [whole, fraction = ''] = text.split('.');
  const multiplier = unit === 'crore' ? BigInt(10000000) : unit === 'lakh' ? BigInt(100000) : BigInt(1);
  const cents = (BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, '0'))) * multiplier;
  if (cents > BigInt('99999999999999999')) throw new Error('Amount is too large');
  return `${cents / BigInt(100)}.${String(cents % BigInt(100)).padStart(2, '0')}`;
}

export function structuredPricePayload(type: PriceType, currency: PriceCurrency, minimum: string, maximum: string, unit: 'amount' | 'lakh' | 'crore') {
  if (type === 'CONTACT_FOR_PRICE') return { price_type: type, price_currency: currency, price_min: null, price_max: null };
  const price_min = normalizeEntryAmount(minimum, currency, unit);
  const price_max = type === 'RANGE' ? normalizeEntryAmount(maximum, currency, unit) : null;
  if (price_max && BigInt(price_max.replace('.', '')) < BigInt(price_min.replace('.', ''))) throw new Error('Maximum price must be at least minimum price');
  return { price_type: type, price_currency: currency, price_min, price_max };
}

export function convertPriceAmount(
  amount: string | number,
  fromCurrency: PriceCurrency,
  toCurrency: PriceCurrency,
  rates?: Record<string, number>
): number {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (!Number.isFinite(num) || num <= 0) return 0;
  if (fromCurrency === toCurrency) return num;

  const currentRates = rates || (typeof window !== 'undefined' ? useCurrencyStore.getState().rates : null) || {
    INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044,
  };

  const fromRate = currentRates[fromCurrency] ?? 1;
  const toRate = currentRates[toCurrency] ?? 1;

  // convert fromCurrency -> INR -> toCurrency
  const inrAmount = num / fromRate;
  return inrAmount * toRate;
}

export function formatSinglePriceAmount(val: number, currency: PriceCurrency): string {
  if (currency === 'INR') {
    if (val >= 1e7) {
      const cr = val / 1e7;
      return `₹${cr >= 100 ? Math.round(cr).toLocaleString('en-IN') : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
    }
    if (val >= 1e5) {
      const lk = val / 1e5;
      return `₹${lk >= 100 ? Math.round(lk).toLocaleString('en-IN') : lk.toFixed(2).replace(/\.?0+$/, '')} L`;
    }
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  }

  if (currency === 'AED') {
    if (val >= 1e6) {
      const m = val / 1e6;
      return `AED ${m >= 100 ? Math.round(m).toLocaleString('en-US') : m.toFixed(2).replace(/\.?0+$/, '')}M`;
    }
    return `AED ${Math.round(val).toLocaleString('en-US')}`;
  }

  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] || `${currency} `;

  if (val >= 1e6) {
    const m = val / 1e6;
    return `${sym}${m >= 100 ? Math.round(m).toLocaleString('en-US') : m.toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  return `${sym}${Math.round(val).toLocaleString('en-US')}`;
}

export function formatPropertyPrice(
  property: PropertyPricing,
  targetCurrency?: PriceCurrency,
  rates?: Record<string, number>
): string {
  const { price_type: type, price_currency: baseCurrency, price_min: min, price_max: max } = property;

  // Resolve target currency: passed explicitly, or from global store, or default to baseCurrency / 'INR'
  const activeCurrency: PriceCurrency =
    targetCurrency ||
    (typeof window !== 'undefined' ? useCurrencyStore.getState().currency : undefined) ||
    baseCurrency ||
    'INR';

  if (type === 'CONTACT_FOR_PRICE') return 'Contact for Price';

  // If structured pricing is present
  if (type && baseCurrency && min) {
    const formatValue = (amtStr: string) => {
      const converted = convertPriceAmount(amtStr, baseCurrency, activeCurrency, rates);
      return formatSinglePriceAmount(converted, activeCurrency);
    };

    if (type === 'STARTING_FROM') return `Starting from ${formatValue(min)}`;
    if (type === 'RANGE' && max) return `${formatValue(min)} – ${formatValue(max)}`;
    return formatValue(min);
  }

  // Fallback for legacy price string or number
  const rawPriceStr = String(property.price ?? '').trim();
  if (!rawPriceStr || /contact for price|price on request/i.test(rawPriceStr)) {
    return rawPriceStr || 'Price on Request';
  }

  // Parse legacy price to see if we can convert it
  // Detect if legacy string specifies a currency
  let detectedCurrency: PriceCurrency = baseCurrency || 'INR';
  if (/^[$]/i.test(rawPriceStr) || /\busd\b/i.test(rawPriceStr)) detectedCurrency = 'USD';
  else if (/^[€]/i.test(rawPriceStr) || /\beur\b/i.test(rawPriceStr)) detectedCurrency = 'EUR';
  else if (/^[£]/i.test(rawPriceStr) || /\bgbp\b/i.test(rawPriceStr)) detectedCurrency = 'GBP';
  else if (/\baed\b/i.test(rawPriceStr)) detectedCurrency = 'AED';
  else if (/^[₹]/i.test(rawPriceStr) || /\binr\b/i.test(rawPriceStr)) detectedCurrency = 'INR';

  // Extract numeric component with unit (Cr / Lakh)
  const cleaned = rawPriceStr.toLowerCase().replace(/,/g, '');
  const match = cleaned.match(/[\d.]+/);
  if (match) {
    let numeric = parseFloat(match[0]);
    if (Number.isFinite(numeric) && numeric > 0) {
      if (cleaned.includes('cr') || cleaned.includes('crore')) {
        numeric *= 10000000;
      } else if (cleaned.includes('lac') || cleaned.includes('lakh')) {
        numeric *= 100000;
      } else if (cleaned.includes('m') || cleaned.includes('million')) {
        numeric *= 1000000;
      } else if (cleaned.includes('k')) {
        numeric *= 1000;
      }
      const converted = convertPriceAmount(numeric, detectedCurrency, activeCurrency, rates);
      return formatSinglePriceAmount(converted, activeCurrency);
    }
  }

  return rawPriceStr;
}
