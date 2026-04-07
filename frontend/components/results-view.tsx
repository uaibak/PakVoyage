'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiBaseUrl } from '@/lib/api';
import { GeneratedItinerary, SavedItinerary, TripRequest } from '@/lib/types';

export function ResultsView(): JSX.Element {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [tripRequest, setTripRequest] = useState<TripRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);

  useEffect(() => {
    try {
      const storedItinerary = localStorage.getItem('pakvoyage.generatedItinerary');
      const storedRequest = localStorage.getItem('pakvoyage.tripRequest');

      setItinerary(
        storedItinerary ? (JSON.parse(storedItinerary) as GeneratedItinerary) : null,
      );
      setTripRequest(storedRequest ? (JSON.parse(storedRequest) as TripRequest) : null);
    } catch {
      setError('Saved itinerary data could not be read from your browser.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async (): Promise<void> => {
    if (!itinerary || !tripRequest) {
      setError('Generate an itinerary first before saving it.');
      return;
    }

    setSaving(true);
    setError('');

    try {
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
          itinerary_days: itinerary.itinerary_days.map((day) => ({
            day_number: day.day_number,
            destination_id: day.destination.id,
            activities: day.activities,
            cost: day.cost,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to save itinerary');
      }

      const saved = (await response.json()) as SavedItinerary;
      setSavedItinerary(saved);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while saving the itinerary.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading your itinerary...</p>;
  }

  if (!itinerary || !tripRequest) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-semibold text-slate-950">No itinerary found</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Start in the planner to generate a trip, then come back here for the full
          day-by-day breakdown.
        </p>
        <Link
          href="/planner"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Open planner
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_32px_80px_rgba(15,23,42,0.24)]">
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Trip summary</p>
        <h1 className="mt-3 text-4xl font-semibold">{itinerary.trip_summary}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          {tripRequest.days} days • PKR {tripRequest.budget.toLocaleString()} budget •{' '}
          {tripRequest.interests.join(', ')}
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-semibold text-slate-950">Day-by-day plan</h2>
          <div className="mt-6 space-y-4">
            {itinerary.itinerary_days.map((day) => (
              <article
                key={`${day.day_number}-${day.destination.id}`}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    Day {day.day_number}: {day.destination.name}
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                    PKR {day.cost.toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{day.destination.region}</p>
                <p className="mt-4 text-sm leading-6 text-slate-700">{day.activities}</p>
                <Link
                  href={`/destination/${day.destination.id}`}
                  className="mt-4 inline-flex text-sm font-medium text-emerald-700 transition hover:text-emerald-900"
                >
                  Explore destination
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <h2 className="text-xl font-semibold text-slate-950">Cost breakdown</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Hotel</span>
                <span>PKR {itinerary.cost_breakdown.hotel.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Transport</span>
                <span>PKR {itinerary.cost_breakdown.transport.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Food</span>
                <span>PKR {itinerary.cost_breakdown.food.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                <span>Total</span>
                <span>PKR {itinerary.cost_breakdown.total.toLocaleString()}</span>
              </div>
            </div>
            <p
              className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                itinerary.cost_breakdown.is_within_budget
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {itinerary.cost_breakdown.is_within_budget
                ? 'This plan fits inside your stated budget.'
                : 'This plan is above your stated budget. Try fewer days or a different interest mix.'}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <h2 className="text-xl font-semibold text-slate-950">Actions</h2>
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving itinerary...' : 'Save itinerary'}
              </button>
              <Link
                href="/planner"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
              >
                Plan another trip
              </Link>
            </div>

            {savedItinerary ? (
              <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Itinerary saved successfully. ID: {savedItinerary.id}
              </p>
            ) : null}

            {error ? (
              <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  );
}
