'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiBaseUrl } from '@/lib/api';
import { parseApiError } from '@/lib/api-error';
import { SectionHeading } from '@/components/section-heading';
import { StatPill } from '@/components/stat-pill';
import {
  CustomTripRegistration,
  GeneratedItinerary,
  SavedItinerary,
  TripRequest,
} from '@/lib/types';

export function ResultsView() {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [tripRequest, setTripRequest] = useState<TripRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveError, setSaveError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [registering, setRegistering] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>('');
  const [registration, setRegistration] = useState<CustomTripRegistration | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [seats, setSeats] = useState<string>('1');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  useEffect(() => {
    try {
      const storedItinerary = localStorage.getItem('pakvoyage.generatedItinerary');
      const storedRequest = localStorage.getItem('pakvoyage.tripRequest');

      setItinerary(
        storedItinerary ? (JSON.parse(storedItinerary) as GeneratedItinerary) : null,
      );
      setTripRequest(storedRequest ? (JSON.parse(storedRequest) as TripRequest) : null);
    } catch {
      setSaveError('Saved itinerary data could not be read from your browser.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async (): Promise<void> => {
    if (!itinerary || !tripRequest) {
      setSaveError('Generate an itinerary first before saving it.');
      return;
    }

    setSaving(true);
    setSaveError('');

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
        throw await parseApiError(response);
      }

      const saved = (await response.json()) as SavedItinerary;
      setSavedItinerary(saved);
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

  const handleRegisterCustomTrip = async (): Promise<void> => {
    if (!itinerary || !tripRequest) {
      setRegisterError('Generate an itinerary first before registering this trip.');
      return;
    }

    setRegistering(true);
    setRegisterError('');

    try {
      const response = await fetch(`${apiBaseUrl}/itinerary/register-custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itinerary_id: savedItinerary?.id,
          full_name: fullName,
          email,
          phone,
          seats: Number(seats),
          days: tripRequest.days,
          budget: tripRequest.budget,
          interests: tripRequest.interests,
          trip_summary: itinerary.trip_summary,
          destinations: itinerary.destinations.map((destination) => destination.name),
          estimated_total: itinerary.cost_breakdown.total,
          special_requests: specialRequests || undefined,
        }),
      });

      if (!response.ok) {
        throw await parseApiError(response);
      }

      const registrationResponse = (await response.json()) as CustomTripRegistration;
      setRegistration(registrationResponse);
    } catch (requestError) {
      setRegisterError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while registering your custom trip.',
      );
    } finally {
      setRegistering(false);
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
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatPill label="Trip length" value={`${tripRequest.days} days`} tone="dark" />
            <StatPill
              label="Target budget"
              value={`PKR ${tripRequest.budget.toLocaleString()}`}
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
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                          {day.destination.region}
                        </p>
                        <h3 className="mt-2 text-2xl text-slate-950 [font-family:var(--font-heading)]">
                          {day.destination.name}
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-full border border-[rgba(34,101,74,0.14)] bg-[rgba(34,101,74,0.08)] px-4 py-2 text-sm font-semibold text-[var(--pine)]">
                      PKR {day.cost.toLocaleString()}
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
            </div>

            {savedItinerary ? (
              <p className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
                Itinerary saved successfully. ID: {savedItinerary.id}
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
              If this generated plan works for you, submit your details and we will log your
              registration against this exact itinerary proposal.
            </p>

            {registration ? (
              <p className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
                Registration submitted. ID: {registration.id}
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--emerald)]"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--emerald)]"
                />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone"
                  className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--emerald)]"
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={seats}
                  onChange={(event) => setSeats(event.target.value)}
                  placeholder="Seats"
                  className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--emerald)]"
                />
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(event) => setSpecialRequests(event.target.value)}
                  placeholder="Special requests (optional)"
                  className="w-full resize-none rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--emerald)]"
                />

                <button
                  type="button"
                  onClick={handleRegisterCustomTrip}
                  disabled={registering}
                  className="cta-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registering ? 'Submitting registration...' : 'Register this trip'}
                </button>

                {registerError ? (
                  <p className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                    {registerError}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
