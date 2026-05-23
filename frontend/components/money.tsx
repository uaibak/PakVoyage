'use client';

import { useEffect, useState } from 'react';
import { apiBaseUrl } from '@/lib/api';
import {
  convertPkrToDisplay,
  defaultPricingSelection,
  DisplayCurrency,
  estimatePackageTotal,
  formatMoney,
  PricingQuote,
  PricingSelection,
  readPricingSelection,
} from '@/lib/pricing';

interface MoneyProps {
  amountPkr: number;
  destinationId?: string;
  suffix?: string;
}

interface PackageSeatPriceProps {
  packageId?: string;
  pricePerSeatPkr: number;
  seats?: number;
  suffix?: string;
}

export function Money({
  amountPkr,
  destinationId,
  suffix = '',
}: MoneyProps) {
  const [selection, setSelection] = useState(defaultPricingSelection);
  const [quote, setQuote] = useState<PricingQuote | null>(null);

  useEffect(() => {
    setSelection(readPricingSelection());
  }, []);

  useEffect(() => {
    if (!destinationId) {
      setQuote(null);
      return;
    }

    fetchQuote(`/destinations/${destinationId}/quote`, selection)
      .then(setQuote)
      .catch(() => setQuote(null));
  }, [destinationId, selection]);

  const currency: DisplayCurrency = quote?.currency ?? selection.display_currency;
  const amount = quote?.display_total ?? convertPkrToDisplay(amountPkr, currency);

  return (
    <>
      {formatMoney(amount, currency)}
      {suffix}
    </>
  );
}

export function PackageSeatPrice({
  packageId,
  pricePerSeatPkr,
  seats = 1,
  suffix = '',
}: PackageSeatPriceProps) {
  const [selection, setSelection] = useState(defaultPricingSelection);
  const [quote, setQuote] = useState<PricingQuote | null>(null);

  useEffect(() => {
    setSelection(readPricingSelection());
  }, []);

  useEffect(() => {
    if (!packageId) {
      setQuote(null);
      return;
    }

    fetchQuote(`/packages/${packageId}/quote`, selection, seats)
      .then(setQuote)
      .catch(() => setQuote(null));
  }, [packageId, seats, selection]);

  return (
    <>
      {formatMoney(
        quote?.display_total ?? estimatePackageTotal(pricePerSeatPkr, seats, selection),
        quote?.currency ?? selection.display_currency,
      )}
      {suffix}
    </>
  );
}

async function fetchQuote(
  path: string,
  selection: PricingSelection,
  seats?: number,
): Promise<PricingQuote> {
  const params = new URLSearchParams({
    pricing_market: selection.pricing_market,
    display_currency: selection.display_currency,
  });

  if (seats !== undefined) {
    params.set('seats', String(seats));
  }

  const response = await fetch(`${apiBaseUrl}${path}?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Could not load quote.');
  }

  return (await response.json()) as PricingQuote;
}
