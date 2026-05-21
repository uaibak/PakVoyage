import {
  AdminBooking,
  AdminCustomRegistration,
  AdminOverview,
  AdminPackage,
} from '@/lib/admin-types';

export function AdminDashboard({
  overview,
  summary,
  pendingBookings,
  pendingCustomTrips,
  lowSeatPackages,
}: {
  overview: AdminOverview | null;
  summary: Array<{ label: string; value: number }>;
  pendingBookings: AdminBooking[];
  pendingCustomTrips: AdminCustomRegistration[];
  lowSeatPackages: AdminPackage[];
}) {
  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article key={item.label} className="premium-card px-5 py-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
          </article>
        ))}
      </section>
      <section className="premium-card p-6">
        <p className="eyebrow">Confirmed revenue</p>
        <p className="mt-2 text-3xl text-slate-950 [font-family:var(--font-heading)]">
          PKR {(overview?.confirmed_revenue ?? 0).toLocaleString()}
        </p>
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <article className="premium-card p-5">
          <p className="eyebrow">Pending bookings</p>
          <div className="mt-4 space-y-3">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((item) => (
                <div key={item.id} className="rounded-[14px] border border-slate-200 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{item.full_name}</p>
                  <p className="text-xs text-slate-600">
                    {item.package.title} | {item.seats} seats
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No pending bookings.</p>
            )}
          </div>
        </article>
        <article className="premium-card p-5">
          <p className="eyebrow">Pending custom trips</p>
          <div className="mt-4 space-y-3">
            {pendingCustomTrips.length > 0 ? (
              pendingCustomTrips.map((item) => (
                <div key={item.id} className="rounded-[14px] border border-slate-200 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{item.full_name}</p>
                  <p className="text-xs text-slate-600">
                    {item.days} days | PKR {item.estimated_total.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No pending custom trips.</p>
            )}
          </div>
        </article>
        <article className="premium-card p-5">
          <p className="eyebrow">Low seats</p>
          <div className="mt-4 space-y-3">
            {lowSeatPackages.length > 0 ? (
              lowSeatPackages.map((pkg) => (
                <div key={pkg.id} className="rounded-[14px] border border-slate-200 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{pkg.title}</p>
                  <p className="text-xs text-slate-600">
                    {pkg.available_seats}/{pkg.total_seats} seats left
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No low-seat active packages.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
