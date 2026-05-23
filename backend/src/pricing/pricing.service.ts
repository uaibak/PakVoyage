import { Injectable } from '@nestjs/common';
import {
  DisplayCurrency,
  PricingBreakdownDisplay,
  PricingBreakdownPkr,
  PricingMarket,
  PricingQuote,
  PricingSelection,
} from './pricing.types';

type PricingProfile = {
  hotelMultiplier: number;
  transportMultiplier: number;
  foodMultiplier: number;
  guideMultiplier: number;
  securityCostPerDayPkr: number;
  serviceMultiplier: number;
  packageMultiplier: number;
};

const pricingProfiles: Record<PricingMarket, PricingProfile> = {
  [PricingMarket.LocalPakistan]: {
    hotelMultiplier: 1,
    transportMultiplier: 1,
    foodMultiplier: 1,
    guideMultiplier: 1,
    securityCostPerDayPkr: 0,
    serviceMultiplier: 1,
    packageMultiplier: 1,
  },
  [PricingMarket.China]: {
    hotelMultiplier: 1.45,
    transportMultiplier: 1.35,
    foodMultiplier: 1.2,
    guideMultiplier: 1.4,
    securityCostPerDayPkr: 18000,
    serviceMultiplier: 1.25,
    packageMultiplier: 1.35,
  },
  [PricingMarket.International]: {
    hotelMultiplier: 1.6,
    transportMultiplier: 1.5,
    foodMultiplier: 1.3,
    guideMultiplier: 1.5,
    securityCostPerDayPkr: 22000,
    serviceMultiplier: 1.3,
    packageMultiplier: 1.5,
  },
};

const defaultCurrencyByMarket: Record<PricingMarket, DisplayCurrency> = {
  [PricingMarket.LocalPakistan]: DisplayCurrency.PKR,
  [PricingMarket.China]: DisplayCurrency.CNY,
  [PricingMarket.International]: DisplayCurrency.USD,
};

const pkrToCurrencyRates: Record<DisplayCurrency, number> = {
  [DisplayCurrency.PKR]: 1,
  [DisplayCurrency.USD]: 0.0036,
  [DisplayCurrency.CNY]: 0.0258,
  [DisplayCurrency.GBP]: 0.0028,
  [DisplayCurrency.AED]: 0.0132,
  [DisplayCurrency.SAR]: 0.0135,
  [DisplayCurrency.EUR]: 0.0033,
};

@Injectable()
export class PricingService {
  quoteItinerary(
    base: {
      hotel: number;
      transport: number;
      food: number;
      guide?: number;
      days: number;
    },
    selection: PricingSelection,
  ): PricingQuote {
    const market = this.resolveMarket(selection.pricing_market);
    const currency = this.resolveCurrency(selection.display_currency, market);
    const profile = pricingProfiles[market];

    const hotel = Math.round(base.hotel * profile.hotelMultiplier);
    const transport = Math.round(base.transport * profile.transportMultiplier);
    const food = Math.round(base.food * profile.foodMultiplier);
    const guide = Math.round((base.guide ?? 0) * profile.guideMultiplier);
    const security = Math.round(base.days * profile.securityCostPerDayPkr);
    const subtotal = hotel + transport + food + guide + security;
    const total = Math.round(subtotal * profile.serviceMultiplier);
    const service = total - subtotal;

    return this.buildQuote(
      {
        hotel,
        transport,
        food,
        guide,
        security,
        service,
        total,
      },
      market,
      currency,
      profile.serviceMultiplier,
    );
  }

  quotePackageSeat(
    basePricePerSeatPkr: number,
    seats: number,
    selection: PricingSelection,
  ): PricingQuote {
    const market = this.resolveMarket(selection.pricing_market);
    const currency = this.resolveCurrency(selection.display_currency, market);
    const profile = pricingProfiles[market];
    const total = Math.round(basePricePerSeatPkr * seats * profile.packageMultiplier);
    const service = Math.max(0, total - basePricePerSeatPkr * seats);

    return this.buildQuote(
      {
        hotel: 0,
        transport: 0,
        food: 0,
        guide: 0,
        security: 0,
        service,
        total,
      },
      market,
      currency,
      profile.packageMultiplier,
    );
  }

  quoteDestinationDay(
    avgCostPerDayPkr: number,
    selection: PricingSelection,
  ): PricingQuote {
    const market = this.resolveMarket(selection.pricing_market);
    const currency = this.resolveCurrency(selection.display_currency, market);
    const profile = pricingProfiles[market];
    const hotel = Math.round(avgCostPerDayPkr * profile.hotelMultiplier);
    const transport = Math.round(avgCostPerDayPkr * 0.25 * profile.transportMultiplier);
    const food = Math.round(avgCostPerDayPkr * 0.2 * profile.foodMultiplier);
    const subtotal = hotel + transport + food;
    const total = Math.round(subtotal * profile.serviceMultiplier);
    const service = total - subtotal;

    return this.buildQuote(
      {
        hotel,
        transport,
        food,
        guide: 0,
        security: profile.securityCostPerDayPkr,
        service,
        total: total + profile.securityCostPerDayPkr,
      },
      market,
      currency,
      profile.serviceMultiplier,
    );
  }

  quoteItineraryDay(
    dayCostPkr: number,
    selection: PricingSelection,
  ): PricingQuote {
    const market = this.resolveMarket(selection.pricing_market);
    const currency = this.resolveCurrency(selection.display_currency, market);
    const profile = pricingProfiles[market];
    const hotel = Math.round(dayCostPkr * profile.hotelMultiplier);
    const subtotal = hotel;
    const total = Math.round(subtotal * profile.serviceMultiplier);
    const service = total - subtotal;

    return this.buildQuote(
      {
        hotel,
        transport: 0,
        food: 0,
        guide: 0,
        security: 0,
        service,
        total,
      },
      market,
      currency,
      profile.serviceMultiplier,
    );
  }

  convertPkr(amountPkr: number, currency: DisplayCurrency): number {
    return this.roundMoney(amountPkr * pkrToCurrencyRates[currency], currency);
  }

  private buildQuote(
    breakdownPkrWithoutDisplay: PricingBreakdownPkr,
    market: PricingMarket,
    currency: DisplayCurrency,
    serviceMultiplier: number,
  ): PricingQuote {
    const exchangeRate = pkrToCurrencyRates[currency];
    const breakdownDisplay = Object.entries(breakdownPkrWithoutDisplay).reduce(
      (result, [key, value]) => ({
        ...result,
        [key]: this.roundMoney(value * exchangeRate, currency),
      }),
      {} as PricingBreakdownDisplay,
    );

    return {
      market,
      currency,
      exchange_rate: exchangeRate,
      service_multiplier: serviceMultiplier,
      base_total_pkr: breakdownPkrWithoutDisplay.total,
      display_total: breakdownDisplay.total,
      breakdown_pkr: breakdownPkrWithoutDisplay,
      breakdown_display: breakdownDisplay,
    };
  }

  private resolveMarket(market?: PricingMarket): PricingMarket {
    return market && pricingProfiles[market]
      ? market
      : PricingMarket.LocalPakistan;
  }

  private resolveCurrency(
    currency: DisplayCurrency | undefined,
    market: PricingMarket,
  ): DisplayCurrency {
    return currency && pkrToCurrencyRates[currency]
      ? currency
      : defaultCurrencyByMarket[market];
  }

  private roundMoney(amount: number, currency: DisplayCurrency): number {
    if (currency === DisplayCurrency.PKR) {
      return Math.round(amount);
    }

    return Math.round(amount * 100) / 100;
  }
}
