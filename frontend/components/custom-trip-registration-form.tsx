'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiBaseUrl } from '@/lib/api';
import { parseApiError } from '@/lib/api-error';
import { CustomTripRegistration, GeneratedItinerary, TripRequest } from '@/lib/types';

export function CustomTripRegistrationForm() {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [tripRequest, setTripRequest] = useState<TripRequest | null>(null);
  const [savedItineraryId, setSavedItineraryId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [registration, setRegistration] = useState<CustomTripRegistration | null>(null);

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [nationalId, setNationalId] = useState<string>('');
  const [seats, setSeats] = useState<string>('1');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const baseCostPerSeat = itinerary?.cost_breakdown.total ?? 0;
  const totalAmount = useMemo(() => {
    return baseCostPerSeat * (Number(seats) || 0);
  }, [baseCostPerSeat, seats]);

  useEffect(() => {
    try {
      const storedItinerary = localStorage.getItem('pakvoyage.generatedItinerary');
      const storedRequest = localStorage.getItem('pakvoyage.tripRequest');
      const storedSavedItinerary = localStorage.getItem('pakvoyage.savedItineraryId');

      setItinerary(
        storedItinerary ? (JSON.parse(storedItinerary) as GeneratedItinerary) : null,
      );
      setTripRequest(storedRequest ? (JSON.parse(storedRequest) as TripRequest) : null);
      setSavedItineraryId(storedSavedItinerary ?? '');
    } catch {
      setError('Custom itinerary data could not be read from your browser.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!itinerary || !tripRequest) {
      setError('Generate an itinerary first, then open this registration page.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/itinerary/register-custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itinerary_id: savedItineraryId || undefined,
          full_name: fullName,
          email,
          phone,
          national_id: nationalId,
          seats: Number(seats),
          days: tripRequest.days,
          budget: tripRequest.budget,
          interests: tripRequest.interests,
          trip_summary: itinerary.trip_summary,
          destinations: itinerary.destinations.map((destination) => destination.name),
          estimated_total: totalAmount,
          special_requests: specialRequests || undefined,
        }),
      });

      if (!response.ok) {
        throw await parseApiError(response);
      }

      const registrationResponse = (await response.json()) as CustomTripRegistration;
      setRegistration(registrationResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while registering your custom trip.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Preparing your custom itinerary details...</p>;
  }

  if (!itinerary || !tripRequest) {
    return (
      <div className="premium-card p-8 text-center">
        <p className="eyebrow">No itinerary data</p>
        <h1 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
          Generate a trip before registration
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          We could not find a generated itinerary in your current session.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/planner" className="cta-primary">
            Open planner
          </Link>
        </div>
      </div>
    );
  }

  if (registration) {
    return (
      <div className="premium-card p-8">
        <p className="eyebrow">Registration complete</p>
        <h1 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
          Your custom trip request has been submitted.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          Registration ID: <span className="font-semibold text-slate-950">{registration.id}</span>
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          Status: <span className="font-semibold text-slate-950">{registration.status}</span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/results" className="cta-secondary">
            Back to results
          </Link>
          <Link href="/planner" className="cta-primary">
            Plan another trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
      <section className="premium-card p-8">
        <p className="eyebrow">Selected custom itinerary</p>
        <h1 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
          {itinerary.trip_summary}
        </h1>
        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Days</span>
            <span>{tripRequest.days}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Budget</span>
            <span>PKR {tripRequest.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Price per seat</span>
            <span>PKR {baseCostPerSeat.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Selected seats</span>
            <span>{Number(seats || 0)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold text-slate-900">
            <span>Estimated total</span>
            <span>PKR {totalAmount.toLocaleString()}</span>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Destinations</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {itinerary.destinations.map((destination) => (
                <span
                  key={destination.id}
                  className="rounded-full border border-slate-200 bg-[rgba(245,239,229,1)] px-3 py-2 text-sm text-slate-700"
                >
                  {destination.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="premium-card p-8">
        <p className="eyebrow">Traveler details</p>
        <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
          Register for this trip plan
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="rounded-[22px] border border-slate-200 bg-white p-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Full name</span>
            <input
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-3 w-full bg-transparent text-base text-slate-950 outline-none"
            />
          </label>
          <label className="rounded-[22px] border border-slate-200 bg-white p-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-3 w-full bg-transparent text-base text-slate-950 outline-none"
            />
          </label>
          <label className="rounded-[22px] border border-slate-200 bg-white p-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Phone</span>
            <input
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-3 w-full bg-transparent text-base text-slate-950 outline-none"
            />
          </label>
          <label className="rounded-[22px] border border-slate-200 bg-white p-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600">
              CNIC / Passport number
            </span>
            <input
              required
              value={nationalId}
              onChange={(event) => setNationalId(event.target.value)}
              className="mt-3 w-full bg-transparent text-base text-slate-950 outline-none"
            />
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[0.45fr_0.55fr]">
          <label className="rounded-[22px] border border-slate-200 bg-white p-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Seats</span>
            <input
              required
              type="number"
              min={1}
              max={10}
              value={seats}
              onChange={(event) => setSeats(event.target.value)}
              className="mt-3 w-full bg-transparent text-3xl text-slate-950 outline-none [font-family:var(--font-heading)]"
            />
          </label>
          <label className="rounded-[22px] border border-slate-200 bg-white p-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Special requests</span>
            <textarea
              rows={4}
              value={specialRequests}
              onChange={(event) => setSpecialRequests(event.target.value)}
              className="mt-3 w-full resize-none bg-transparent text-base text-slate-950 outline-none"
            />
          </label>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-white px-5 py-5">
          <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
            <span>Total payable</span>
            <span className="text-xl font-semibold text-slate-950">
              PKR {totalAmount.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            PKR {baseCostPerSeat.toLocaleString()} per seat
          </p>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="cta-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting registration...' : 'Submit custom trip registration'}
          </button>

          {error ? (
            <p className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              {error}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
