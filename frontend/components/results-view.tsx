'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiBaseUrl } from '@/lib/api';
import { parseApiError } from '@/lib/api-error';
import { SectionHeading } from '@/components/section-heading';
import { StatPill } from '@/components/stat-pill';
import { convertPkrToDisplay, formatMoney } from '@/lib/pricing';
import {
  GeneratedItinerary,
  SavedItinerary,
  TripRequest,
} from '@/lib/types';

interface ResultsViewProps {
  itineraryId?: string;
}

function savedToGeneratedItinerary(saved: SavedItinerary): GeneratedItinerary {
  const destinations = saved.itinerary_days
    .map((day) => day.destination)
    .filter(
      (destination, index, all) =>
        all.findIndex((item) => item.id === destination.id) === index,
    );
  const destinationNames = destinations.map((destination) => destination.name);
  const displayBreakdown = {
    hotel: convertPkrToDisplay(saved.hotel_cost, saved.display_currency),
    transport: convertPkrToDisplay(saved.transport_cost, saved.display_currency),
    food: convertPkrToDisplay(saved.food_cost, saved.display_currency),
    guide: 0,
    security: convertPkrToDisplay(saved.security_cost, saved.display_currency),
    service: convertPkrToDisplay(saved.service_cost, saved.display_currency),
    total:
      saved.display_total ??
      convertPkrToDisplay(saved.total_cost, saved.display_currency),
  };

  return {
    trip_summary: `${saved.days}-day route through ${destinationNames.join(', ')}`,
    destinations,
    itinerary_days: saved.itinerary_days.map((day) => ({
      day_number: day.day_number,
      destination: day.destination,
      activities: day.activities,
      cost: day.cost,
    })),
    cost_breakdown: {
      hotel: saved.hotel_cost,
      transport: saved.transport_cost,
      food: saved.food_cost,
      total: saved.total_cost,
      is_within_budget: saved.total_cost <= saved.budget,
    },
    pricing: {
      market: saved.pricing_market,
      currency: saved.display_currency,
      exchange_rate: saved.exchange_rate,
      service_multiplier:
        saved.total_cost > 0
          ? saved.total_cost /
            Math.max(
              saved.hotel_cost +
                saved.transport_cost +
                saved.food_cost +
                saved.security_cost,
              1,
            )
          : 1,
      base_total_pkr: saved.total_cost,
      display_total:
        saved.display_total ??
        convertPkrToDisplay(saved.total_cost, saved.display_currency),
      breakdown_pkr: {
        hotel: saved.hotel_cost,
        transport: saved.transport_cost,
        food: saved.food_cost,
        guide: 0,
        security: saved.security_cost,
        service: saved.service_cost,
        total: saved.total_cost,
      },
      breakdown_display: displayBreakdown,
    },
  };
}

function savedToTripRequest(saved: SavedItinerary): TripRequest {
  return {
    days: saved.days,
    budget: saved.budget,
    interests: saved.interests,
    pricing_market: saved.pricing_market,
    display_currency: saved.display_currency,
  };
}

export function ResultsView({ itineraryId }: ResultsViewProps) {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [tripRequest, setTripRequest] = useState<TripRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveError, setSaveError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (itineraryId) {
        try {
          const response = await fetch(`${apiBaseUrl}/itinerary/${itineraryId}`, {
            cache: 'no-store',
          });

          if (!response.ok) {
            throw await parseApiError(response);
          }

          const saved = (await response.json()) as SavedItinerary;
          setSavedItinerary(saved);
          setItinerary(savedToGeneratedItinerary(saved));
          setTripRequest(savedToTripRequest(saved));
          localStorage.setItem('pakvoyage.savedItineraryId', saved.id);
          return;
        } catch (requestError) {
          setSaveError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not load the shared itinerary.',
          );
        } finally {
          setLoading(false);
        }
      }

      try {
        const storedItinerary = localStorage.getItem('pakvoyage.generatedItinerary');
        const storedRequest = localStorage.getItem('pakvoyage.tripRequest');
        setItinerary(
          storedItinerary ? (JSON.parse(storedItinerary) as GeneratedItinerary) : null,
        );
        setTripRequest(storedRequest ? (JSON.parse(storedRequest) as TripRequest) : null);
      } catch (err) {
        console.error('Error reading local storage:', err);
        setSaveError('The session data has been corrupted. Please try generating a new itinerary.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [itineraryId]);

  const saveItinerary = async (): Promise<SavedItinerary> => {
    if (savedItinerary?.id) {
      return savedItinerary;
    }

    if (!itinerary || !tripRequest) {
      throw new Error('Generate an itinerary first before saving it.');
    }

    const response = await fetch(`${apiBaseUrl}/itinerary/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        days: tripRequest.days,
        budget: tripRequest.budget,
        interests: tripRequest.interests,
        total_cost: itinerary.cost_breakdown.total,
        hotel_cost: itinerary.cost_breakdown.hotel,
        transport_cost: itinerary.cost_breakdown.transport,
        food_cost: itinerary.cost_breakdown.food,
        pricing_market: itinerary.pricing?.market,
        display_currency: itinerary.pricing?.currency,
        exchange_rate: itinerary.pricing?.exchange_rate,
        display_total: itinerary.pricing?.display_total,
        security_cost: itinerary.pricing?.breakdown_pkr.security,
        service_cost: itinerary.pricing?.breakdown_pkr.service,
        itinerary_days: itinerary.itinerary_days.map((day) => ({
          day_number: day.day_number,
          destination_id: day.destination.id,
          activities: day.activities,
          cost: day.cost,
        })),
      }),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    const saved = (await response.json()) as SavedItinerary;
    setSavedItinerary(saved);
    localStorage.setItem('pakvoyage.savedItineraryId', saved.id);
    return saved;
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setSaveError('');

    try {
      await saveItinerary();
    } catch (requestError) {
      setSaveError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while saving the itinerary.',
      );
    } finally {
      setSaving(false);
    }
  };

  const displayCost = (
    pkrAmount: number,
    displayAmount?: number,
  ): string => {
    if (!itinerary?.pricing) {
      return `PKR ${pkrAmount.toLocaleString()}`;
    }

    return formatMoney(
      displayAmount ?? pkrAmount,
      itinerary.pricing.currency,
    );
  };

  const displayPkrAmount = (pkrAmount: number): string => {
    if (!itinerary?.pricing) {
      return `PKR ${pkrAmount.toLocaleString()}`;
    }

    return formatMoney(
      convertPkrToDisplay(pkrAmount, itinerary.pricing.currency),
      itinerary.pricing.currency,
    );
  };

  const handleShare = async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      setSaving(true);
      setSaveError('');

      try {
        const saved = await saveItinerary();
        const url = `${window.location.origin}/results?id=${encodeURIComponent(saved.id)}`;
        await navigator.clipboard.writeText(url);
        window.history.replaceState(null, '', `/results?id=${encodeURIComponent(saved.id)}`);
      } catch (requestError) {
        setSaveError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not create a shareable itinerary link.',
        );
        setSaving(false);
        return;
      }

      setSaving(false);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading your itinerary...</p>;
  }

  if (!itinerary || !tripRequest) {
    return (
      <div className="premium-card mx-auto max-w-3xl p-10 text-center md:p-14">
        <p className="eyebrow">No itinerary yet</p>
        <h1 className="mt-5 text-4xl text-slate-950 [font-family:var(--font-heading)] md:text-5xl">
          Build your route first, then return here for the full journey view.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600">
          Your generated plan, day-by-day sequence, and cost breakdown will appear here once
          PakVoyage creates an itinerary for you.
        </p>
        <Link href="/planner" className="cta-primary mt-8 inline-flex">
          Open planner
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="premium-card-dark overflow-hidden px-7 py-8 md:px-10 md:py-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Generated route</p>
            <h1 className="mt-5 max-w-4xl text-4xl leading-[0.98] text-white md:text-6xl [font-family:var(--font-heading)]">
              {itinerary.trip_summary}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
              A curated plan shaped around your timeline, budget, and interests across Pakistan.
              Everything below is arranged to help you review the trip quickly and save it with
              confidence.
            </p>
            {shareSuccess && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-medium text-emerald-200 border border-emerald-500/30 animate-in fade-in slide-in-from-top-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Link copied to clipboard!
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatPill label="Trip length" value={`${tripRequest.days} days`} tone="dark" />
            <StatPill
              label="Target budget"
              value={displayPkrAmount(tripRequest.budget)}
              tone="dark"
            />
            <StatPill
              label="Pricing market"
              value={itinerary.pricing?.market ?? tripRequest.pricing_market ?? 'LOCAL_PK'}
              tone="dark"
            />
            <StatPill
              label="Travel mood"
              value={tripRequest.interests.join(', ')}
              tone="dark"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="premium-card p-6 md:p-8">
          <SectionHeading
            eyebrow="Itinerary"
            title="Day-by-day route"
            description="Each stop is ordered to keep the journey practical while still feeling memorable."
          />

          <div className="mt-8 space-y-5">
            {itinerary.itinerary_days.map((day) => (
              <article
                key={`${day.day_number}-${day.destination.id}`}
                className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-medium)] md:p-6"
              >
                <div className="absolute inset-y-6 left-6 hidden w-px bg-[linear-gradient(180deg,rgba(34,101,74,0.24),rgba(34,101,74,0))] md:block" />

                <div className="relative md:pl-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(34,101,74,0.1)] text-sm font-semibold text-[var(--pine)]">
                        {String(day.day_number).padStart(2, '0')}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                          {day.destination.region}
                        </p>
                        <h3 className="mt-1 text-2xl text-slate-950 [font-family:var(--font-heading)]">
                          {day.destination.name}
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-full border border-[rgba(34,101,74,0.14)] bg-[rgba(34,101,74,0.08)] px-4 py-2 text-sm font-semibold text-[var(--pine)]">
                      {day.pricing
                        ? formatMoney(day.pricing.display_total, day.pricing.currency)
                        : displayPkrAmount(day.cost)}
                    </div>
                  </div>

                  <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-800 md:text-[15px]">
                    {day.activities}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-600">
                      Best time: {day.destination.best_time}
                    </div>
                    <Link
                      href={`/destination/${day.destination.id}`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-[rgba(34,101,74,0.2)] hover:text-[var(--pine)]"
                    >
                      Explore destination
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <div className="premium-card p-6 md:p-7">
            <p className="eyebrow">Budget outlook</p>
            <h2 className="mt-4 text-3xl text-slate-950 [font-family:var(--font-heading)]">
              Cost breakdown
            </h2>
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Hotel</span>
                <span>
                  {displayCost(
                    itinerary.cost_breakdown.hotel,
                    itinerary.pricing?.breakdown_display.hotel,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Transport</span>
                <span>
                  {displayCost(
                    itinerary.cost_breakdown.transport,
                    itinerary.pricing?.breakdown_display.transport,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Food</span>
                <span>
                  {displayCost(
                    itinerary.cost_breakdown.food,
                    itinerary.pricing?.breakdown_display.food,
                  )}
                </span>
              </div>
              {itinerary.pricing && itinerary.pricing.breakdown_pkr.security > 0 ? (
                <div className="flex items-center justify-between">
                  <span>Security and handling</span>
                  <span>
                    {displayCost(
                      itinerary.pricing.breakdown_pkr.security,
                      itinerary.pricing.breakdown_display.security,
                    )}
                  </span>
                </div>
              ) : null}
              {itinerary.pricing && itinerary.pricing.breakdown_pkr.service > 0 ? (
                <div className="flex items-center justify-between">
                  <span>Service adjustment</span>
                  <span>
                    {displayCost(
                      itinerary.pricing.breakdown_pkr.service,
                      itinerary.pricing.breakdown_display.service,
                    )}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                <span>Total</span>
                <span>
                  {displayCost(
                    itinerary.cost_breakdown.total,
                    itinerary.pricing?.display_total,
                  )}
                </span>
              </div>
            </div>
            <p
              className={`mt-6 rounded-[24px] px-4 py-4 text-sm leading-6 ${
                itinerary.cost_breakdown.is_within_budget
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              {itinerary.cost_breakdown.is_within_budget
                ? 'This plan fits inside your stated budget.'
                : 'This plan is above your stated budget. Try fewer days or a different interest mix.'}
            </p>
          </div>

          <div className="premium-card p-6 md:p-7">
            <p className="eyebrow">Next move</p>
            <h2 className="mt-4 text-3xl text-slate-950 [font-family:var(--font-heading)]">
              Save or refine
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="cta-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving itinerary...' : 'Save itinerary'}
              </button>
              <Link href="/planner" className="cta-secondary w-full justify-center">
                Plan another trip
              </Link>
              <button
                type="button"
                onClick={() => void handleShare()}
                disabled={saving}
                className="cta-secondary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Preparing link...' : 'Copy share link'}
              </button>
            </div>

            {savedItinerary ? (
              <p className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
                Itinerary saved successfully. Reference: <strong>{savedItinerary.id}</strong>
              </p>
            ) : null}

            {saveError ? (
              <p className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
                {saveError}
              </p>
            ) : null}

            <div className="mt-6 rounded-[24px] bg-[rgba(15,23,42,0.04)] px-5 py-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Destinations included
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {itinerary.destinations.map((destination) => (
                  <span
                    key={destination.id}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    {destination.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="premium-card p-6 md:p-7">
            <p className="eyebrow">Travel registration</p>
            <h2 className="mt-4 text-3xl text-slate-950 [font-family:var(--font-heading)]">
              Register for this custom itinerary
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              If this generated plan works for you, continue to the dedicated registration page
              where traveler identity details are required.
            </p>
            <div className="mt-5">
              <Link
                href={
                  savedItinerary?.id
                    ? `/custom-trip/register?itinerary_id=${encodeURIComponent(savedItinerary.id)}`
                    : '/custom-trip/register'
                }
                className="cta-primary w-full justify-center"
              >
                Continue to registration form
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
