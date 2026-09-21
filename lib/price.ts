/**
 * Universal Price Normalization & Formatting Utility for Frontend
 */

/**
 * Parses arbitrary price input into a clean non-negative number.
 * Never returns NaN.
 */
export function parseNumericPrice(
  price: string | number | null | undefined,
): number {
  if (price === null || price === undefined) return 0;

  if (typeof price === 'number') {
    return Number.isNaN(price) || !Number.isFinite(price) || price < 0 ? 0 : price;
  }

  const clean = price
    .toString()
    .toLowerCase()
    .replace(/,/g, '')
    .trim();

  if (!clean || clean.includes('nan')) return 0;

  const match = clean.match(/[\d.]+/);

  if (!match) return 0;

  const val = parseFloat(match[0]);

  if (Number.isNaN(val) || !Number.isFinite(val) || val < 0) return 0;

  if (clean.includes('cr') || clean.includes('crore')) {
    return Math.round(val * 10_000_000);
  }

  if (clean.includes('lac') || clean.includes('lakh')) {
    return Math.round(val * 100_000);
  }

  if (clean.includes('million')) {
    return Math.round(val * 1_000_000);
  }

  // Check for 'k' / thousand (avoid false positives like 'bhk', 'park', 'block')
  const hasK =
    /\b\d+\.?\d*\s*k\b/i.test(clean) ||
    clean.endsWith('k') ||
    (clean.includes('k') && !clean.includes('bhk') && !clean.includes('park') && !clean.includes('block'));

  if (hasK) {
    return Math.round(val * 1_000);
  }

  return val;
}

/**
 * Formats property prices for display.
 *
 * Guarantees:
 * - Never returns ₹NaN.
 * - Preserves foreign currencies without incorrect rupee symbol prefixing.
 * - Preserves original non-empty valid string if parsing fails.
 * - Formats standard numbers in Indian numbering system (Cr / Lakh / INR locale).
 */
export function formatPrice(rawPrice: unknown): string {
  // If rawPrice contains foreign currency notation, preserve original raw text
  if (typeof rawPrice === 'string') {
    const trimmed = rawPrice.trim();
    if (/[$€£¥]|^(usd|eur|gbp|aed|cad|aud)\b/i.test(trimmed)) {
      return trimmed;
    }
  }

  const n = parseNumericPrice(
    rawPrice as string | number | null | undefined,
  );

  if (!n) {
    if (
      typeof rawPrice === 'string' &&
      rawPrice.trim().length > 0 &&
      !/nan/i.test(rawPrice)
    ) {
      return rawPrice.trim();
    }

    return 'Price on Request';
  }

  if (n >= 10_000_000) {
    return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  }

  if (n >= 100_000) {
    return `₹${(n / 100_000).toFixed(2)} Lakh`;
  }

  return `₹${n.toLocaleString('en-IN')}`;
}
