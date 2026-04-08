'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiBaseUrl } from '@/lib/api';
import { parseApiError } from '@/lib/api-error';
import { adminFetch, clearAdminToken, getAdminProfile, getAdminToken } from '@/lib/admin-auth';
import { AdminBooking, AdminCustomRegistration, AdminDestination, AdminOverview, AdminPackage } from '@/lib/admin-types';
import { BookingStatus } from '@/lib/types';

type Section = 'overview' | 'content' | 'operations';
type ContentTab = 'destinations' | 'packages';
type OpsTab = 'bookings' | 'custom';

const statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED'];

function csvToArray(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function AdminPortal() {
  const router = useRouter();
  const [section, setSection] = useState<Section>('overview');
  const [contentTab, setContentTab] = useState<ContentTab>('destinations');
  const [opsTab, setOpsTab] = useState<OpsTab>('bookings');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [busyId, setBusyId] = useState<string>('');
  const [showDestinationForm, setShowDestinationForm] = useState<boolean>(false);
  const [showPackageForm, setShowPackageForm] = useState<boolean>(false);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [customRegistrations, setCustomRegistrations] = useState<AdminCustomRegistration[]>([]);

  const [destinationForm, setDestinationForm] = useState({ name: '', region: '', description: '', best_time: '', avg_cost_per_day: '' });
  const [packageForm, setPackageForm] = useState({
    title: '', slug: '', region: '', summary: '', description: '', travel_date: '', duration_days: '',
    price_per_seat: '', total_seats: '', available_seats: '', pickup_city: '', package_type: '',
    destinations: '', inclusions: '',
  });

  useEffect(() => {
    const run = async (): Promise<void> => {
      if (!getAdminToken()) {
        router.replace('/admin/login');
        return;
      }
      await refreshAll();
    };
    void run();
  }, [router]);

  const refreshAll = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const profile = await getAdminProfile();
      setAdminUsername(profile.username);
      const [o, d, p, b, c] = await Promise.all([
        adminFetch(`${apiBaseUrl}/admin/overview`, { cache: 'no-store' }),
        adminFetch(`${apiBaseUrl}/admin/destinations`, { cache: 'no-store' }),
        adminFetch(`${apiBaseUrl}/admin/packages?include_inactive=true`, { cache: 'no-store' }),
        adminFetch(`${apiBaseUrl}/admin/bookings`, { cache: 'no-store' }),
        adminFetch(`${apiBaseUrl}/admin/custom-registrations`, { cache: 'no-store' }),
      ]);
      if (!o.ok) throw await parseApiError(o);
      if (!d.ok) throw await parseApiError(d);
      if (!p.ok) throw await parseApiError(p);
      if (!b.ok) throw await parseApiError(b);
      if (!c.ok) throw await parseApiError(c);
      setOverview((await o.json()) as AdminOverview);
      setDestinations((await d.json()) as AdminDestination[]);
      setPackages((await p.json()) as AdminPackage[]);
      setBookings((await b.json()) as AdminBooking[]);
      setCustomRegistrations((await c.json()) as AdminCustomRegistration[]);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to load admin data.';
      if (message.toLowerCase().includes('unauthorized')) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createDestination = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusyId('create-destination');
    setError('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...destinationForm, avg_cost_per_day: Number(destinationForm.avg_cost_per_day) }),
      });
      if (!response.ok) throw await parseApiError(response);
      setDestinationForm({ name: '', region: '', description: '', best_time: '', avg_cost_per_day: '' });
      setShowDestinationForm(false);
      await refreshAll();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create destination.');
    } finally {
      setBusyId('');
    }
  };

  const createPackage = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusyId('create-package');
    setError('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...packageForm,
          duration_days: Number(packageForm.duration_days),
          price_per_seat: Number(packageForm.price_per_seat),
          total_seats: Number(packageForm.total_seats),
          available_seats: Number(packageForm.available_seats),
          destinations: csvToArray(packageForm.destinations),
          inclusions: csvToArray(packageForm.inclusions),
          is_active: true,
        }),
      });
      if (!response.ok) throw await parseApiError(response);
      setPackageForm({ title: '', slug: '', region: '', summary: '', description: '', travel_date: '', duration_days: '', price_per_seat: '', total_seats: '', available_seats: '', pickup_city: '', package_type: '', destinations: '', inclusions: '' });
      setShowPackageForm(false);
      await refreshAll();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create package.');
    } finally {
      setBusyId('');
    }
  };

  const patchBookingStatus = async (id: string, status: BookingStatus): Promise<void> => {
    setBusyId(id);
    const response = await adminFetch(`${apiBaseUrl}/admin/bookings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!response.ok) setError((await parseApiError(response)).message);
    await refreshAll();
    setBusyId('');
  };

  const patchCustomStatus = async (id: string, status: BookingStatus): Promise<void> => {
    setBusyId(id);
    const response = await adminFetch(`${apiBaseUrl}/admin/custom-registrations/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!response.ok) setError((await parseApiError(response)).message);
    await refreshAll();
    setBusyId('');
  };

  const patchPackage = async (pkg: AdminPackage, patch: Partial<AdminPackage>): Promise<void> => {
    setBusyId(pkg.id);
    const response = await adminFetch(`${apiBaseUrl}/admin/packages/${pkg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    if (!response.ok) setError((await parseApiError(response)).message);
    await refreshAll();
    setBusyId('');
  };

  const deleteDestination = async (id: string): Promise<void> => {
    setBusyId(id);
    const response = await adminFetch(`${apiBaseUrl}/admin/destinations/${id}`, { method: 'DELETE' });
    if (!response.ok) setError((await parseApiError(response)).message);
    await refreshAll();
    setBusyId('');
  };

  const summary = overview
    ? [
        { label: 'Destinations', value: overview.destinations_count },
        { label: 'Packages', value: overview.packages_count },
        { label: 'Pending bookings', value: overview.pending_bookings_count },
        { label: 'Pending custom', value: overview.pending_custom_registrations_count },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="premium-card-dark px-7 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Admin portal</p>
            <h1 className="mt-3 text-4xl text-white [font-family:var(--font-heading)]">Operations dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <p className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-slate-100">{adminUsername || 'admin'}</p>
            <button type="button" onClick={() => void refreshAll()} className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white">Refresh</button>
            <button type="button" onClick={() => { clearAdminToken(); router.replace('/admin/login'); }} className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white">Logout</button>
          </div>
        </div>
      </section>

      <section className="premium-card p-4">
        <div className="flex flex-wrap gap-2">
          {(['overview', 'content', 'operations'] as Section[]).map((item) => (
            <button key={item} type="button" onClick={() => setSection(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${section === item ? 'bg-[var(--pine)] text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {error ? <p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      {loading ? <div className="premium-card p-6 text-sm text-slate-600">Loading admin data...</div> : null}

      {!loading && section === 'overview' ? (
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
            <p className="mt-2 text-3xl text-slate-950 [font-family:var(--font-heading)]">PKR {(overview?.confirmed_revenue ?? 0).toLocaleString()}</p>
          </section>
        </div>
      ) : null}

      {!loading && section === 'content' ? (
        <div className="space-y-4">
          <section className="premium-card p-4">
            <div className="flex gap-2">
              <button type="button" onClick={() => setContentTab('destinations')} className={`rounded-full px-4 py-2 text-sm font-semibold ${contentTab === 'destinations' ? 'bg-[var(--pine)] text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Destinations</button>
              <button type="button" onClick={() => setContentTab('packages')} className={`rounded-full px-4 py-2 text-sm font-semibold ${contentTab === 'packages' ? 'bg-[var(--pine)] text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Packages</button>
            </div>
          </section>

          {contentTab === 'destinations' ? (
            <section className="premium-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-3xl text-slate-950 [font-family:var(--font-heading)]">Destination management</h2>
                <button type="button" onClick={() => setShowDestinationForm((s) => !s)} className="cta-primary">{showDestinationForm ? 'Close form' : 'Add destination'}</button>
              </div>
              {showDestinationForm ? (
                <form onSubmit={createDestination} className="grid gap-3">
                  <input required placeholder="Name" value={destinationForm.name} onChange={(e) => setDestinationForm((p) => ({ ...p, name: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Region" value={destinationForm.region} onChange={(e) => setDestinationForm((p) => ({ ...p, region: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Best time" value={destinationForm.best_time} onChange={(e) => setDestinationForm((p) => ({ ...p, best_time: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required type="number" min={0} placeholder="Average cost per day" value={destinationForm.avg_cost_per_day} onChange={(e) => setDestinationForm((p) => ({ ...p, avg_cost_per_day: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <textarea required rows={3} placeholder="Description" value={destinationForm.description} onChange={(e) => setDestinationForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <button type="submit" disabled={busyId === 'create-destination'} className="cta-primary w-full justify-center">{busyId === 'create-destination' ? 'Creating...' : 'Create destination'}</button>
                </form>
              ) : null}
              <div className="space-y-3">
                {destinations.map((destination) => (
                  <article key={destination.id} className="rounded-[16px] border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div><p className="font-semibold text-slate-900">{destination.name}</p><p className="text-sm text-slate-600">{destination.region}</p></div>
                      <div className="flex gap-2">
                        <button type="button" disabled={busyId === destination.id} className="cta-secondary px-4 py-2" onClick={() => void deleteDestination(destination.id)}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {contentTab === 'packages' ? (
            <section className="premium-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-3xl text-slate-950 [font-family:var(--font-heading)]">Package management</h2>
                <button type="button" onClick={() => setShowPackageForm((s) => !s)} className="cta-primary">{showPackageForm ? 'Close form' : 'Add package'}</button>
              </div>
              {showPackageForm ? (
                <form onSubmit={createPackage} className="grid gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input required placeholder="Title" value={packageForm.title} onChange={(e) => setPackageForm((p) => ({ ...p, title: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Slug" value={packageForm.slug} onChange={(e) => setPackageForm((p) => ({ ...p, slug: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Region" value={packageForm.region} onChange={(e) => setPackageForm((p) => ({ ...p, region: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="date" value={packageForm.travel_date} onChange={(e) => setPackageForm((p) => ({ ...p, travel_date: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="number" min={1} placeholder="Duration days" value={packageForm.duration_days} onChange={(e) => setPackageForm((p) => ({ ...p, duration_days: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="number" min={0} placeholder="Price per seat" value={packageForm.price_per_seat} onChange={(e) => setPackageForm((p) => ({ ...p, price_per_seat: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="number" min={1} placeholder="Total seats" value={packageForm.total_seats} onChange={(e) => setPackageForm((p) => ({ ...p, total_seats: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="number" min={0} placeholder="Available seats" value={packageForm.available_seats} onChange={(e) => setPackageForm((p) => ({ ...p, available_seats: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Pickup city" value={packageForm.pickup_city} onChange={(e) => setPackageForm((p) => ({ ...p, pickup_city: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Package type" value={packageForm.package_type} onChange={(e) => setPackageForm((p) => ({ ...p, package_type: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  </div>
                  <input required placeholder="Destinations (comma separated)" value={packageForm.destinations} onChange={(e) => setPackageForm((p) => ({ ...p, destinations: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Inclusions (comma separated)" value={packageForm.inclusions} onChange={(e) => setPackageForm((p) => ({ ...p, inclusions: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Summary" value={packageForm.summary} onChange={(e) => setPackageForm((p) => ({ ...p, summary: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <textarea required rows={3} placeholder="Description" value={packageForm.description} onChange={(e) => setPackageForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <button type="submit" disabled={busyId === 'create-package'} className="cta-primary w-full justify-center">{busyId === 'create-package' ? 'Creating...' : 'Create package'}</button>
                </form>
              ) : null}
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <article key={pkg.id} className="rounded-[16px] border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><p className="font-semibold text-slate-900">{pkg.title}</p><p className="text-sm text-slate-600">{pkg.region} | {pkg.available_seats}/{pkg.total_seats} seats</p></div>
                      <div className="flex gap-2">
                        <button type="button" disabled={busyId === pkg.id} className="cta-secondary px-4 py-2" onClick={() => void patchPackage(pkg, { is_active: !pkg.is_active })}>{pkg.is_active ? 'Disable' : 'Enable'}</button>
                        <button type="button" disabled={busyId === pkg.id} className="cta-secondary px-4 py-2" onClick={() => void patchPackage(pkg, { available_seats: pkg.available_seats + 1 })}>+1 seat</button>
                        <button type="button" disabled={busyId === pkg.id} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700" onClick={() => void patchPackage(pkg, { is_active: false })}>Archive</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {!loading && section === 'operations' ? (
        <div className="space-y-4">
          <section className="premium-card p-4">
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpsTab('bookings')} className={`rounded-full px-4 py-2 text-sm font-semibold ${opsTab === 'bookings' ? 'bg-[var(--pine)] text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Bookings</button>
              <button type="button" onClick={() => setOpsTab('custom')} className={`rounded-full px-4 py-2 text-sm font-semibold ${opsTab === 'custom' ? 'bg-[var(--pine)] text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Custom registrations</button>
            </div>
          </section>
          <section className="premium-card p-6">
            <h2 className="text-3xl text-slate-950 [font-family:var(--font-heading)]">{opsTab === 'bookings' ? 'Booking operations' : 'Custom trip operations'}</h2>
            <div className="mt-4 space-y-3">
              {opsTab === 'bookings'
                ? bookings.map((item) => (
                    <article key={item.id} className="rounded-[16px] border border-slate-200 bg-white p-4">
                      <p className="font-semibold text-slate-900">{item.full_name}</p>
                      <p className="text-sm text-slate-600">{item.package.title} | {item.seats} seats</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {statuses.map((status) => (
                          <button key={`${item.id}-${status}`} type="button" disabled={busyId === item.id || item.status === status} onClick={() => void patchBookingStatus(item.id, status)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${item.status === status ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700'}`}>{status}</button>
                        ))}
                      </div>
                    </article>
                  ))
                : customRegistrations.map((item) => (
                    <article key={item.id} className="rounded-[16px] border border-slate-200 bg-white p-4">
                      <p className="font-semibold text-slate-900">{item.full_name}</p>
                      <p className="text-sm text-slate-600">{item.seats} seats | PKR {item.estimated_total.toLocaleString()}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {statuses.map((status) => (
                          <button key={`${item.id}-${status}`} type="button" disabled={busyId === item.id || item.status === status} onClick={() => void patchCustomStatus(item.id, status)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${item.status === status ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700'}`}>{status}</button>
                        ))}
                      </div>
                    </article>
                  ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
