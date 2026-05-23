export enum PricingMarket {
  LocalPakistan = 'LOCAL_PK',
  China = 'CHINA',
  International = 'INTERNATIONAL',
}

export enum DisplayCurrency {
  PKR = 'PKR',
  USD = 'USD',
  CNY = 'CNY',
  GBP = 'GBP',
  AED = 'AED',
  SAR = 'SAR',
  EUR = 'EUR',
}

export interface PricingSelection {
  pricing_market?: PricingMarket;
  display_currency?: DisplayCurrency;
}

export interface PricingBreakdownPkr {
  hotel: number;
  transport: number;
  food: number;
  guide: number;
  security: number;
  service: number;
  total: number;
}

export interface PricingBreakdownDisplay {
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
  breakdown_pkr: PricingBreakdownPkr;
  breakdown_display: PricingBreakdownDisplay;
}
