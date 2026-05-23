'use client';

import {
  currencyForMarket,
  DisplayCurrency,
  displayCurrencies,
  PricingMarket,
  pricingMarkets,
  PricingSelection,
} from '@/lib/pricing';

interface PricingSelectorProps {
  value: PricingSelection;
  onChange: (selection: PricingSelection) => void;
  compact?: boolean;
}

export function PricingSelector({
  value,
  onChange,
  compact = false,
}: PricingSelectorProps) {
  const updateMarket = (market: PricingMarket): void => {
    onChange({
      pricing_market: market,
      display_currency: currencyForMarket(market),
    });
  };

  const updateCurrency = (currency: DisplayCurrency): void => {
    onChange({
      ...value,
      display_currency: currency,
    });
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">
            Pricing
          </p>
          {!compact ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose the customer market for rates, then the currency used on screen.
            </p>
          ) : null}
        </div>
        <select
          value={value.display_currency}
          onChange={(event) => updateCurrency(event.target.value as DisplayCurrency)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 outline-none"
          aria-label="Display currency"
        >
          {displayCurrencies.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {pricingMarkets.map((market) => {
          const active = value.pricing_market === market.value;

          return (
            <button
              key={market.value}
              type="button"
              onClick={() => updateMarket(market.value)}
              className={`min-h-24 rounded-[18px] border px-4 py-3 text-left transition ${
                active
                  ? 'border-[rgba(34,101,74,0.28)] bg-[rgba(34,101,74,0.08)] text-slate-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-[rgba(34,101,74,0.2)]'
              }`}
            >
              <span className="block text-sm font-semibold">{market.label}</span>
              {!compact ? (
                <span className="mt-2 block text-xs leading-5 text-slate-600">
                  {market.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
