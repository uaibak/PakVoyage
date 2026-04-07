'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiBaseUrl } from '@/lib/api';
import { GeneratedItinerary, TravelInterest } from '@/lib/types';

const interestOptions: { label: string; value: TravelInterest; description: string }[] = [
  {
    label: 'Mountains',
    value: 'mountains',
    description: 'Hunza, Skardu, Swat, and scenic northern drives.',
  },
  {
    label: 'Culture',
    value: 'culture',
    description: 'Historic cities, architecture, museums, and local stories.',
  },
  {
    label: 'Food',
    value: 'food',
    description: 'Street food, regional favorites, and cafe stops.',
  },
];

export function PlannerForm() {
  const router = useRouter();
  const [days, setDays] = useState<string>('7');
  const [budget, setBudget] = useState<string>('70000');
  const [interests, setInterests] = useState<TravelInterest[]>(['mountains']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const selectedLabel = useMemo(
    () => (interests.length > 0 ? interests.join(', ') : 'pick at least one interest'),
    [interests],
  );

  const toggleInterest = (interest: TravelInterest): void => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (interests.length === 0) {
      setError('Select at least one interest so PakVoyage can tailor the trip.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/itinerary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: Number(days),
          budget: Number(budget),
          interests,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to generate itinerary');
      }

      const data = (await response.json()) as GeneratedItinerary;
      localStorage.setItem('pakvoyage.generatedItinerary', JSON.stringify(data));
      localStorage.setItem(
        'pakvoyage.tripRequest',
        JSON.stringify({
          days: Number(days),
          budget: Number(budget),
          interests,
        }),
      );
      router.push('/results');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while generating the itinerary.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/10 bg-slate-950 p-8 text-white shadow-[0_32px_80px_rgba(15,23,42,0.28)]"
    >
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
              Trip inputs
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">
              Build a practical Pakistan itinerary in seconds
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Tell us your trip length, spending range, and travel vibe. We&apos;ll map
              destinations, daily flow, and a cost breakdown you can actually use.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block rounded-3xl border border-white/10 bg-white/5 p-5">
              <span className="text-sm text-slate-300">Days</span>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={days}
                onChange={(event) => setDays(event.target.value)}
                className="mt-3 w-full bg-transparent text-3xl font-semibold text-white outline-none"
              />
            </label>

            <label className="block rounded-3xl border border-white/10 bg-white/5 p-5">
              <span className="text-sm text-slate-300">Budget (PKR)</span>
              <input
                type="number"
                min={1000}
                required
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="mt-3 w-full bg-transparent text-3xl font-semibold text-white outline-none"
              />
            </label>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-200">Interests</p>
          <div className="mt-5 space-y-3">
            {interestOptions.map((option) => {
              const active = interests.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleInterest(option.value)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                    active
                      ? 'border-emerald-300 bg-emerald-300/10'
                      : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                  }`}
                >
                  <span className="block text-base font-medium">{option.label}</span>
                  <span className="mt-1 block text-sm text-slate-300">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm text-slate-300">Current mix: {selectedLabel}</p>

          {error ? (
            <p className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Generating itinerary...' : 'Generate itinerary'}
          </button>
        </div>
      </div>
    </form>
  );
}
