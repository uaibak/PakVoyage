import { AdminBooking, AdminCustomRegistration } from '@/lib/admin-types';
import { BookingStatus } from '@/lib/types';

export type OpsTab = 'bookings' | 'custom';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminOperations({
  opsTab,
  setOpsTab,
  opsStatusFilter,
  setOpsStatusFilter,
  statuses,
  bookings,
  customRegistrations,
  busyId,
  patchBookingStatus,
  patchCustomStatus,
}: {
  opsTab: OpsTab;
  setOpsTab: (tab: OpsTab) => void;
  opsStatusFilter: string;
  setOpsStatusFilter: (status: string) => void;
  statuses: BookingStatus[];
  bookings: AdminBooking[];
  customRegistrations: AdminCustomRegistration[];
  busyId: string;
  patchBookingStatus: (id: string, status: BookingStatus) => void;
  patchCustomStatus: (id: string, status: BookingStatus) => void;
}) {
  return (
    <div className="space-y-4">
      <section className="premium-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOpsTab('bookings')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              opsTab === 'bookings'
                ? 'bg-[var(--pine)] text-white'
                : 'border border-slate-200 bg-white text-slate-700'
            }`}
          >
            Bookings
          </button>
          <button
            type="button"
            onClick={() => setOpsTab('custom')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              opsTab === 'custom'
                ? 'bg-[var(--pine)] text-white'
                : 'border border-slate-200 bg-white text-slate-700'
            }`}
          >
            Custom registrations
          </button>
          <select
            value={opsStatusFilter}
            onChange={(event) => setOpsStatusFilter(event.target.value)}
            className="ml-auto rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="premium-card p-6">
        <h2 className="text-3xl text-slate-950 [font-family:var(--font-heading)]">
          {opsTab === 'bookings' ? 'Booking operations' : 'Custom trip operations'}
        </h2>
        <div className="mt-4 space-y-3">
          {opsTab === 'bookings'
            ? bookings.map((item) => (
                <BookingCard
                  key={item.id}
                  item={item}
                  busyId={busyId}
                  statuses={statuses}
                  patchBookingStatus={patchBookingStatus}
                />
              ))
            : customRegistrations.map((item) => (
                <CustomRegistrationCard
                  key={item.id}
                  item={item}
                  busyId={busyId}
                  statuses={statuses}
                  patchCustomStatus={patchCustomStatus}
                />
              ))}
        </div>
      </section>
    </div>
  );
}

function BookingCard({
  item,
  busyId,
  statuses,
  patchBookingStatus,
}: {
  item: AdminBooking;
  busyId: string;
  statuses: BookingStatus[];
  patchBookingStatus: (id: string, status: BookingStatus) => void;
}) {
  return (
    <article className="rounded-[16px] border border-slate-200 bg-white p-4">
      <div className="flex justify-between items-start">
        <p className="font-semibold text-slate-900">{item.full_name}</p>
        <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
          {item.id}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
        <p>
          {item.package.title} | {item.seats} seats | PKR {item.total_amount.toLocaleString()}
        </p>
        <p>Departure: {formatDate(item.package.travel_date)}</p>
        <p>{item.email}</p>
        <p>{item.phone}</p>
        <p>CNIC/passport: {item.national_id}</p>
        <p>Submitted: {formatDate(item.created_at)}</p>
      </div>
      {item.special_requests ? (
        <p className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
          {item.special_requests}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={`${item.id}-${status}`}
            type="button"
            disabled={busyId === item.id || item.status === status}
            onClick={() => patchBookingStatus(item.id, status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              item.status === status
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </article>
  );
}

function CustomRegistrationCard({
  item,
  busyId,
  statuses,
  patchCustomStatus,
}: {
  item: AdminCustomRegistration;
  busyId: string;
  statuses: BookingStatus[];
  patchCustomStatus: (id: string, status: BookingStatus) => void;
}) {
  return (
    <article className="rounded-[16px] border border-slate-200 bg-white p-4">
      <div className="flex justify-between items-start">
        <p className="font-semibold text-slate-900">{item.full_name}</p>
        <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
          {item.id}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
        <p>
          {item.seats} seats | {item.days} days | PKR {item.estimated_total.toLocaleString()}
        </p>
        <p>Budget: PKR {item.budget.toLocaleString()}</p>
        <p>{item.email}</p>
        <p>{item.phone}</p>
        <p>CNIC/passport: {item.national_id}</p>
        <p>Submitted: {formatDate(item.created_at)}</p>
      </div>
      <p className="mt-3 rounded-[14px] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
        {item.trip_summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[...item.destinations, ...item.interests].map((label) => (
          <span
            key={`${item.id}-${label}`}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            {label}
          </span>
        ))}
      </div>
      {item.special_requests ? (
        <p className="mt-3 rounded-[14px] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {item.special_requests}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={`${item.id}-${status}`}
            type="button"
            disabled={busyId === item.id || item.status === status}
            onClick={() => patchCustomStatus(item.id, status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              item.status === status
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </article>
  );
}
