"use client";

import { PriceCurrency, PriceType } from '@/lib/propertyPricing';

export interface PricingFieldValues {
  type: PriceType | 'LEGACY';
  currency: PriceCurrency;
  minimum: string;
  maximum: string;
  unit: 'amount' | 'lakh' | 'crore';
}

export function PropertyPricingFields({ value, onChange, allowLegacy = false }: {
  value: PricingFieldValues;
  onChange: (value: PricingFieldValues) => void;
  allowLegacy?: boolean;
}) {
  const change = (patch: Partial<PricingFieldValues>) => onChange({ ...value, ...patch });
  const inputClass = 'w-full rounded-md border border-white/20 bg-[#0D2137] px-3 py-2 text-white';
  return <div className="space-y-3">
    <label className="block text-sm text-white">Asking Price</label>
    <div className="grid grid-cols-2 gap-3">
      <select aria-label="Price type" className={inputClass} value={value.type} onChange={event => change({ type: event.target.value as PricingFieldValues['type'] })}>
        {allowLegacy && <option value="LEGACY">Keep legacy price</option>}
        <option value="FIXED">Fixed</option>
        <option value="STARTING_FROM">Starting from</option>
        <option value="RANGE">Range</option>
        <option value="CONTACT_FOR_PRICE">Contact for price</option>
      </select>
      <select aria-label="Price currency" className={inputClass} value={value.currency} onChange={event => change({ currency: event.target.value as PriceCurrency, unit: 'amount' })}>
        {(['INR', 'USD', 'EUR', 'GBP', 'AED'] as const).map(currency => <option key={currency} value={currency}>{currency}</option>)}
      </select>
    </div>
    {value.type !== 'CONTACT_FOR_PRICE' && <div className="grid grid-cols-2 gap-3">
      <input aria-label={value.type === 'LEGACY' ? 'Legacy price' : 'Minimum price'} className={inputClass} value={value.minimum} onChange={event => change({ minimum: event.target.value })} placeholder={value.type === 'LEGACY' ? 'Original price text' : 'Amount'} />
      {value.type === 'RANGE' && <input aria-label="Maximum price" className={inputClass} value={value.maximum} onChange={event => change({ maximum: event.target.value })} placeholder="Maximum amount" />}
    </div>}
    {value.currency === 'INR' && value.type !== 'CONTACT_FOR_PRICE' && value.type !== 'LEGACY' && <select aria-label="Amount unit" className={inputClass} value={value.unit} onChange={event => change({ unit: event.target.value as PricingFieldValues['unit'] })}>
      <option value="amount">INR amount</option><option value="lakh">Lakh</option><option value="crore">Crore</option>
    </select>}
  </div>;
}
