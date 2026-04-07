'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiBaseUrl } from '@/lib/api';
import { parseApiError } from '@/lib/api-error';
import { TravelInterest } from '@/lib/types';

const interestOptions: { label: string; value: TravelInterest; description: string }[] = [
  {
    label: 'Mountains',
    value: 'mountains',
    description: 'Hunza, Skardu, alpine drives, lakes, and dramatic northern scenery.',
  },
  {
    label: 'Culture',
    value: 'culture',
    description: 'Historic cities, architecture, museums, craft, and old urban quarters.',
  },
  {
    label: 'Food',
    value: 'food',
    description: 'Street food trails, regional specialties, and memorable local dining.',
  },
];

export function PlannerForm() {
  const router = useRouter();
  const [days, setDays] = useState<string>('7');
  const [budget, setBudget] = useState<string>('70000');
  const [interests, setInterests] = useState<TravelInterest[]>(['mountains']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const destinationHint = useMemo(() => {
    const parsedDays = Number(days);

    if (parsedDays <= 5) return 'Best suited for one deeply focused destination.';
    if (parsedDays <= 10) return 'Ideal for a two-stop route with breathing room.';
    return 'Works well for a broader multi-stop journey.';
  }, [days]);

  const budgetTone = useMemo(() => {
    const parsedBudget = Number(budget);

    if (parsedBudget < 40000) return 'Tighter budget: expect trade-offs on longer routes.';
    if (parsedBudget < 90000) return 'Balanced budget: comfortable for most curated routes.';
    return 'Flexible budget: room for richer pacing and upgrades.';
  }, [budget]);

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
      setError('Select at least one interest so PakVoyage can shape the route well.');
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
        throw await parseApiError(response);
      }

      const data = await response.json();
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
    <div className="shell py-16">
      <div className="premium-card-dark overflow-hidden p-8 md:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Build your route
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl leading-[0.95] text-white md:text-6xl [font-family:var(--font-heading)]">
              Shape a Pakistan itinerary that feels tailored, practical, and worth the journey.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200">
              Choose how long you want to travel, how much you want to spend, and what kind of
              experience you want most. PakVoyage will turn that into a route you can actually use.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-white/12 bg-black/20 p-6">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                  Trip rhythm
                </p>
                <p className="mt-3 text-3xl text-white [font-family:var(--font-heading)]">
                  {days} days
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{destinationHint}</p>
              </div>
              <div className="rounded-[28px] border border-white/12 bg-black/20 p-6">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                  Budget view
                </p>
                <p className="mt-3 text-3xl text-white [font-family:var(--font-heading)]">
                  PKR {Number(budget).toLocaleString()}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{budgetTone}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="premium-card p-7 md:p-8">
            <div className="space-y-7">
              <div>
                <p className="eyebrow">Trip frame</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="rounded-[24px] border border-slate-200 bg-white/96 p-5">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      Days
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      required
                      value={days}
                      onChange={(event) => setDays(event.target.value)}
                      className="mt-3 w-full bg-transparent text-4xl font-semibold text-slate-950 outline-none [font-family:var(--font-heading)]"
                    />
                  </label>

                  <label className="rounded-[24px] border border-slate-200 bg-white/96 p-5">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      Budget
                    </span>
                    <input
                      type="number"
                      min={1000}
                      required
                      value={budget}
                      onChange={(event) => setBudget(event.target.value)}
                      className="mt-3 w-full bg-transparent text-4xl font-semibold text-slate-950 outline-none [font-family:var(--font-heading)]"
                    />
                  </label>
                </div>
              </div>

              <div>
                <p className="eyebrow">Travel mood</p>
                <div className="mt-4 space-y-3">
                  {interestOptions.map((option) => {
                    const active = interests.includes(option.value);

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleInterest(option.value)}
                        className={`w-full rounded-[24px] border p-5 text-left transition duration-300 ${
                          active
                            ? 'border-[rgba(34,101,74,0.18)] bg-[rgba(34,101,74,0.08)] shadow-[var(--shadow-soft)]'
                            : 'border-slate-200 bg-white/90 hover:border-[rgba(34,101,74,0.18)] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-slate-950">{option.label}</p>
                            <p className="mt-2 text-sm leading-7 text-slate-700">
                              {option.description}
                            </p>
                          </div>
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                              active
                                ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white'
                                : 'border-slate-300 text-slate-400'
                            }`}
                          >
                            {active ? 'OK' : '+'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error ? (
                <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="cta-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Generating your route...' : 'Generate premium itinerary'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
