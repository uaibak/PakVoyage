'use client';

import { FormEvent, useMemo, useState } from 'react';
import { apiBaseUrl } from '@/lib/api';
import { parseApiError } from '@/lib/api-error';
import { Booking, TourPackage } from '@/lib/types';

interface BookingFormProps {
  travelPackage: TourPackage;
}

export function BookingForm({
  travelPackage,
}: BookingFormProps) {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [nationalId, setNationalId] = useState<string>('');
  const [seats, setSeats] = useState<string>('1');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);

  const totalAmount = useMemo(() => {
    return travelPackage.price_per_seat * Number(seats || 0);
  }, [seats, travelPackage.price_per_seat]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: travelPackage.id,
          full_name: fullName,
          email,
          phone,
          national_id: nationalId,
          seats: Number(seats),
          special_requests: specialRequests || undefined,
        }),
      });

      if (!response.ok) {
        throw await parseApiError(response);
      }

      const savedBooking = (await response.json()) as Booking;
      setBooking(savedBooking);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while reserving your seats.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (booking) {
    return (
      <div className="premium-card p-7 md:p-8">
        <p className="eyebrow">Reservation received</p>
        <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
          Your seats are now reserved.
        </h2>
        <p className="mt-5 text-sm leading-7 text-slate-700">
          Booking ID: <span className="font-semibold text-slate-950">{booking.id}</span>
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          Status: <span className="font-semibold text-slate-950">{booking.status}</span>
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          Total amount: <span className="font-semibold text-slate-950">PKR {booking.total_amount.toLocaleString()}</span>
        </p>
        <p className="mt-5 rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
          We captured your booking request successfully. You can now follow up with your support or operations team using this booking ID.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card p-7 md:p-8">
      <p className="eyebrow">Reserve your seat</p>
      <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
        Register for this package
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
            max={Math.max(1, travelPackage.available_seats)}
            value={seats}
            onChange={(event) => setSeats(event.target.value)}
            className="mt-3 w-full bg-transparent text-3xl text-slate-950 outline-none [font-family:var(--font-heading)]"
          />
        </label>
        <label className="rounded-[22px] border border-slate-200 bg-white p-4">
          <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Special requests</span>
          <textarea
            value={specialRequests}
            onChange={(event) => setSpecialRequests(event.target.value)}
            rows={4}
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
      </div>

      {error ? (
        <p className="mt-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || travelPackage.available_seats === 0}
        className="cta-primary mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Reserving seats...' : travelPackage.available_seats === 0 ? 'Sold out' : 'Reserve seats'}
      </button>
    </form>
  );
}
