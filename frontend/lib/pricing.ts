export type PricingMarket = 'LOCAL_PK' | 'CHINA' | 'INTERNATIONAL';

export type DisplayCurrency = 'PKR' | 'USD' | 'CNY' | 'GBP' | 'AED' | 'SAR' | 'EUR';

export interface PricingSelection {
  pricing_market: PricingMarket;
  display_currency: DisplayCurrency;
}

export interface PricingBreakdown {
  hotel: number;
  transport: number;
  food: number;
  guide: number;
  security: number;
  service: number;
  total: number;
}

export interface PricingQuote {
  market: PricingMarket;
  currency: DisplayCurrency;
  exchange_rate: number;
  service_multiplier: number;
  base_total_pkr: number;
  display_total: number;
  breakdown_pkr: PricingBreakdown;
  breakdown_display: PricingBreakdown;
}

export const pricingMarkets: { label: string; value: PricingMarket; description: string }[] = [
  {
    label: 'Pakistan resident',
    value: 'LOCAL_PK',
    description: 'Local hotel, transport, and support rates.',
  },
  {
    label: 'China traveler',
    value: 'CHINA',
    description: 'Premium hotels, private transport, guides, and China-focused handling.',
  },
  {
    label: 'International traveler',
    value: 'INTERNATIONAL',
    description: 'Higher-touch facilities, private support, handling, and service coverage.',
  },
];

export const displayCurrencies: { label: string; value: DisplayCurrency }[] = [
  { label: 'PKR', value: 'PKR' },
  { label: 'USD', value: 'USD' },
  { label: 'CNY', value: 'CNY' },
  { label: 'GBP', value: 'GBP' },
  { label: 'AED', value: 'AED' },
  { label: 'SAR', value: 'SAR' },
  { label: 'EUR', value: 'EUR' },
];

const defaultCurrencyByMarket: Record<PricingMarket, DisplayCurrency> = {
  LOCAL_PK: 'PKR',
  CHINA: 'CNY',
  INTERNATIONAL: 'USD',
};

const currencyLocales: Record<DisplayCurrency, string> = {
  PKR: 'en-PK',
  USD: 'en-US',
  CNY: 'zh-CN',
  GBP: 'en-GB',
  AED: 'en-AE',
  SAR: 'ar-SA',
  EUR: 'de-DE',
};

const pkrToCurrencyRates: Record<DisplayCurrency, number> = {
  PKR: 1,
  USD: 0.0036,
  CNY: 0.0258,
  GBP: 0.0028,
  AED: 0.0132,
  SAR: 0.0135,
  EUR: 0.0033,
};

const packageMultiplierByMarket: Record<PricingMarket, number> = {
  LOCAL_PK: 1,
  CHINA: 2.15,
  INTERNATIONAL: 2.45,
};

const storageKey = 'pakvoyage.pricingSelection';

export const defaultPricingSelection: PricingSelection = {
  pricing_market: 'LOCAL_PK',
  display_currency: 'PKR',
};

export function currencyForMarket(market: PricingMarket): DisplayCurrency {
  return defaultCurrencyByMarket[market];
}

export function formatMoney(amount: number, currency: DisplayCurrency): string {
  return new Intl.NumberFormat(currencyLocales[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'PKR' ? 0 : 2,
  }).format(amount);
}

export function estimatePackageTotal(
  basePricePerSeatPkr: number,
  seats: number,
  selection: PricingSelection,
): number {
  const pkrTotal = Math.round(
    basePricePerSeatPkr * seats * packageMultiplierByMarket[selection.pricing_market],
  );
  const converted = pkrTotal * pkrToCurrencyRates[selection.display_currency];

  return selection.display_currency === 'PKR'
    ? Math.round(converted)
    : Math.round(converted * 100) / 100;
}

export function convertPkrToDisplay(
  amountPkr: number,
  currency: DisplayCurrency,
): number {
  const converted = amountPkr * pkrToCurrencyRates[currency];

  return currency === 'PKR'
    ? Math.round(converted)
    : Math.round(converted * 100) / 100;
}

export function convertDisplayToPkr(
  amount: number,
  currency: DisplayCurrency,
): number {
  return Math.round(amount / pkrToCurrencyRates[currency]);
}

function detectPricingSelection(): PricingSelection {
  if (typeof window === 'undefined') {
    return defaultPricingSelection;
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = window.navigator.language.toLowerCase();

  if (timeZone === 'Asia/Karachi' || language.endsWith('-pk')) {
    return defaultPricingSelection;
  }

  if (
    timeZone === 'Asia/Shanghai' ||
    timeZone === 'Asia/Chongqing' ||
    language.startsWith('zh')
  ) {
    return {
      pricing_market: 'CHINA',
      display_currency: 'CNY',
    };
  }

  if (language.endsWith('-gb')) {
    return {
      pricing_market: 'INTERNATIONAL',
      display_currency: 'GBP',
    };
  }

  if (language.endsWith('-ae')) {
    return {
      pricing_market: 'INTERNATIONAL',
      display_currency: 'AED',
    };
  }

  if (language.endsWith('-sa')) {
    return {
      pricing_market: 'INTERNATIONAL',
      display_currency: 'SAR',
    };
  }

  if (
    language.endsWith('-de') ||
    language.endsWith('-fr') ||
    language.endsWith('-it') ||
    language.endsWith('-es') ||
    language.endsWith('-nl')
  ) {
    return {
      pricing_market: 'INTERNATIONAL',
      display_currency: 'EUR',
    };
  }

  return {
    pricing_market: 'INTERNATIONAL',
    display_currency: 'USD',
  };
}

export function readPricingSelection(): PricingSelection {
  if (typeof window === 'undefined') {
    return defaultPricingSelection;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored
      ? {
          ...detectPricingSelection(),
          ...(JSON.parse(stored) as Partial<PricingSelection>),
        }
      : detectPricingSelection();
  } catch {
    return detectPricingSelection();
  }
}

export function savePricingSelection(selection: PricingSelection): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(selection));
}
