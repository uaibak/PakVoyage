'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiBaseUrl } from '@/lib/api';
import { parseApiError } from '@/lib/api-error';
import {
  adminFetch,
  clearAdminToken,
  getAdminProfile,
  getAdminToken,
} from '@/lib/admin-auth';
import {
  AdminBooking,
  AdminCustomRegistration,
  AdminDestination,
  AdminOverview,
  AdminPackage,
} from '@/lib/admin-types';
import { BookingStatus } from '@/lib/types';

type Section = 'overview' | 'content' | 'operations';
type ContentTab = 'destinations' | 'packages';
type OpsTab = 'bookings' | 'custom';

type DestinationFormState = {
  name: string;
  region: string;
  short_summary: string;
  description: string;
  best_time: string;
  avg_cost_per_day: string;
  highlights: string;
  travel_tips: string;
  ideal_for: string;
  cover_image_url: string;
  gallery_image_urls: string;
};

type PackageFormState = {
  title: string;
  slug: string;
  region: string;
  summary: string;
  description: string;
  stay_style: string;
  difficulty_level: string;
  departure_notes: string;
  travel_date: string;
  duration_days: string;
  price_per_seat: string;
  total_seats: string;
  available_seats: string;
  pickup_city: string;
  package_type: string;
  destinations: string;
  inclusions: string;
  exclusions: string;
  itinerary_overview: string;
  cover_image_url: string;
  gallery_image_urls: string;
};

const statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED'];

function csvToArray(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDestinationForm(): DestinationFormState {
  return {
    name: '',
    region: '',
    short_summary: '',
    description: '',
    best_time: '',
    avg_cost_per_day: '',
    highlights: '',
    travel_tips: '',
    ideal_for: '',
    cover_image_url: '',
    gallery_image_urls: '',
  };
}

function buildPackageForm(): PackageFormState {
  return {
    title: '',
    slug: '',
    region: '',
    summary: '',
    description: '',
    stay_style: '',
    difficulty_level: '',
    departure_notes: '',
    travel_date: '',
    duration_days: '',
    price_per_seat: '',
    total_seats: '',
    available_seats: '',
    pickup_city: '',
    package_type: '',
    destinations: '',
    inclusions: '',
    exclusions: '',
    itinerary_overview: '',
    cover_image_url: '',
    gallery_image_urls: '',
  };
}

function toDestinationForm(destination: AdminDestination): DestinationFormState {
  return {
    name: destination.name,
    region: destination.region,
    short_summary: destination.short_summary,
    description: destination.description,
    best_time: destination.best_time,
    avg_cost_per_day: String(destination.avg_cost_per_day),
    highlights: destination.highlights.join(', '),
    travel_tips: destination.travel_tips.join(', '),
    ideal_for: destination.ideal_for.join(', '),
    cover_image_url: destination.cover_image_url,
    gallery_image_urls: destination.gallery_image_urls.join(', '),
  };
}

function toPackageForm(pkg: AdminPackage): PackageFormState {
  return {
    title: pkg.title,
    slug: pkg.slug,
    region: pkg.region,
    summary: pkg.summary,
    description: pkg.description,
    stay_style: pkg.stay_style,
    difficulty_level: pkg.difficulty_level,
    departure_notes: pkg.departure_notes,
    travel_date: pkg.travel_date.slice(0, 10),
    duration_days: String(pkg.duration_days),
    price_per_seat: String(pkg.price_per_seat),
    total_seats: String(pkg.total_seats),
    available_seats: String(pkg.available_seats),
    pickup_city: pkg.pickup_city,
    package_type: pkg.package_type,
    destinations: pkg.destinations.join(', '),
    inclusions: pkg.inclusions.join(', '),
    exclusions: pkg.exclusions.join(', '),
    itinerary_overview: pkg.itinerary_overview.join(', '),
    cover_image_url: pkg.cover_image_url,
    gallery_image_urls: pkg.gallery_image_urls.join(', '),
  };
}

function destinationPayload(form: DestinationFormState) {
  return {
    ...form,
    avg_cost_per_day: Number(form.avg_cost_per_day),
    highlights: csvToArray(form.highlights),
    travel_tips: csvToArray(form.travel_tips),
    ideal_for: csvToArray(form.ideal_for),
    gallery_image_urls: csvToArray(form.gallery_image_urls),
  };
}

function packagePayload(form: PackageFormState) {
  return {
    ...form,
    duration_days: Number(form.duration_days),
    price_per_seat: Number(form.price_per_seat),
    total_seats: Number(form.total_seats),
    available_seats: Number(form.available_seats),
    destinations: csvToArray(form.destinations),
    inclusions: csvToArray(form.inclusions),
    exclusions: csvToArray(form.exclusions),
    itinerary_overview: csvToArray(form.itinerary_overview),
  };
}

export function AdminPortal() {
  const router = useRouter();
  const [section, setSection] = useState<Section>('overview');
  const [contentTab, setContentTab] = useState<ContentTab>('destinations');
  const [opsTab, setOpsTab] = useState<OpsTab>('bookings');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [busyId, setBusyId] = useState<string>('');
  const [showDestinationForm, setShowDestinationForm] = useState<boolean>(false);
  const [showPackageForm, setShowPackageForm] = useState<boolean>(false);
  const [editingDestinationId, setEditingDestinationId] = useState<string>('');
  const [editingPackageId, setEditingPackageId] = useState<string>('');

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [customRegistrations, setCustomRegistrations] = useState<AdminCustomRegistration[]>([]);

  const [destinationForm, setDestinationForm] = useState<DestinationFormState>(
    buildDestinationForm(),
  );
  const [packageForm, setPackageForm] = useState<PackageFormState>(buildPackageForm());

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

  const refreshAll = async (showGlobalLoading = true): Promise<void> => {
    if (showGlobalLoading) setLoading(true);
    setError('');
    // We don't clear success here so it can persist for a few seconds if set by an action
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
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to load admin data.';
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
    setSuccess('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(destinationPayload(destinationForm)),
      });
      if (!response.ok) throw await parseApiError(response);
      setDestinationForm(buildDestinationForm());
      setShowDestinationForm(false);
      setSuccess('Destination created successfully.');
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create destination.');
    } finally {
      setBusyId('');
    }
  };

  const updateDestination = async (
    event: FormEvent<HTMLFormElement>,
    id: string,
  ): Promise<void> => {
    event.preventDefault();
    setBusyId(id);
    setError('');
    setSuccess('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/destinations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(destinationPayload(destinationForm)),
      });
      if (!response.ok) throw await parseApiError(response);
      setEditingDestinationId('');
      setDestinationForm(buildDestinationForm());
      setSuccess('Destination updated successfully.');
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update destination.');
    } finally {
      setBusyId('');
    }
  };

  const createPackage = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusyId('create-package');
    setError('');
    setSuccess('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...packagePayload(packageForm),
          is_active: true,
        }),
      });
      if (!response.ok) throw await parseApiError(response);
      setPackageForm(buildPackageForm());
      setShowPackageForm(false);
      setSuccess('Tour package created successfully.');
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create package.');
    } finally {
      setBusyId('');
    }
  };

  const updatePackage = async (
    event: FormEvent<HTMLFormElement>,
    id: string,
  ): Promise<void> => {
    event.preventDefault();
    setBusyId(id);
    setError('');
    setSuccess('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/packages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packagePayload(packageForm)),
      });
      if (!response.ok) throw await parseApiError(response);
      setEditingPackageId('');
      setPackageForm(buildPackageForm());
      setSuccess('Tour package updated successfully.');
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update package.');
    } finally {
      setBusyId('');
    }
  };

  const patchBookingStatus = async (id: string, status: BookingStatus): Promise<void> => {
    setBusyId(id);
    setError('');
    setSuccess('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw await parseApiError(response);
      setSuccess(`Booking ${id} updated to ${status}.`);
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update booking status.');
    } finally {
      setBusyId('');
    }
  };

  const patchCustomStatus = async (id: string, status: BookingStatus): Promise<void> => {
    setBusyId(id);
    setError('');
    setSuccess('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/custom-registrations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw await parseApiError(response);
      setSuccess(`Registration ${id} updated to ${status}.`);
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update registration status.');
    } finally {
      setBusyId('');
    }
  };

  const patchPackage = async (pkg: AdminPackage, patch: Partial<AdminPackage>): Promise<void> => {
    setBusyId(pkg.id);
    setError('');
    setSuccess('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw await parseApiError(response);
      setSuccess(`Package "${pkg.title}" visibility updated.`);
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update package.');
    } finally {
      setBusyId('');
    }
  };

  const deleteDestination = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this destination? This cannot be undone.')) return;
    
    setBusyId(id);
    setError('');
    setSuccess('');
    try {
      const response = await adminFetch(`${apiBaseUrl}/admin/destinations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw await parseApiError(response);
      setSuccess('Destination deleted successfully.');
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete destination.');
    } finally {
      setBusyId('');
    }
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
            <h1 className="mt-3 text-4xl text-white [font-family:var(--font-heading)]">
              Operations dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <p className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-slate-100">
              {adminUsername || 'admin'}
            </p>
            <button
              type="button"
              onClick={() => void refreshAll()}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                clearAdminToken();
                router.replace('/admin/login');
              }}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="premium-card p-4">
        <div className="flex flex-wrap gap-2">
          {(['overview', 'content', 'operations'] as Section[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSection(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                section === item
                  ? 'bg-[var(--pine)] text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {loading ? (
        <div className="premium-card p-6 text-sm text-slate-600">Loading admin data...</div>
      ) : null}

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
            <p className="mt-2 text-3xl text-slate-950 [font-family:var(--font-heading)]">
              PKR {(overview?.confirmed_revenue ?? 0).toLocaleString()}
            </p>
          </section>
        </div>
      ) : null}

      {!loading && section === 'content' ? (
        <div className="space-y-4">
          <section className="premium-card p-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setContentTab('destinations')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  contentTab === 'destinations'
                    ? 'bg-[var(--pine)] text-white'
                    : 'border border-slate-200 bg-white text-slate-700'
                }`}
              >
                Destinations
              </button>
              <button
                type="button"
                onClick={() => setContentTab('packages')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  contentTab === 'packages'
                    ? 'bg-[var(--pine)] text-white'
                    : 'border border-slate-200 bg-white text-slate-700'
                }`}
              >
                Packages
              </button>
            </div>
          </section>

          {contentTab === 'destinations' ? (
            <section className="premium-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-3xl text-slate-950 [font-family:var(--font-heading)]">
                  Destination management
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDestinationId('');
                    setDestinationForm(buildDestinationForm());
                    setShowDestinationForm((current) => !current);
                  }}
                  className="cta-primary"
                >
                  {showDestinationForm ? 'Close form' : 'Add destination'}
                </button>
              </div>
              {showDestinationForm ? (
                <form onSubmit={createDestination} className="grid gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input required placeholder="Name" value={destinationForm.name} onChange={(e) => setDestinationForm((p) => ({ ...p, name: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Region" value={destinationForm.region} onChange={(e) => setDestinationForm((p) => ({ ...p, region: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Best time" value={destinationForm.best_time} onChange={(e) => setDestinationForm((p) => ({ ...p, best_time: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="number" min={0} placeholder="Average cost per day" value={destinationForm.avg_cost_per_day} onChange={(e) => setDestinationForm((p) => ({ ...p, avg_cost_per_day: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Short summary" value={destinationForm.short_summary} onChange={(e) => setDestinationForm((p) => ({ ...p, short_summary: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-2" />
                    <input required placeholder="Cover image URL" value={destinationForm.cover_image_url} onChange={(e) => setDestinationForm((p) => ({ ...p, cover_image_url: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-2" />
                  </div>
                  <textarea required rows={3} placeholder="Description" value={destinationForm.description} onChange={(e) => setDestinationForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Highlights (comma separated)" value={destinationForm.highlights} onChange={(e) => setDestinationForm((p) => ({ ...p, highlights: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Travel tips (comma separated)" value={destinationForm.travel_tips} onChange={(e) => setDestinationForm((p) => ({ ...p, travel_tips: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Ideal for (comma separated)" value={destinationForm.ideal_for} onChange={(e) => setDestinationForm((p) => ({ ...p, ideal_for: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Gallery image URLs (comma separated)" value={destinationForm.gallery_image_urls} onChange={(e) => setDestinationForm((p) => ({ ...p, gallery_image_urls: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <button type="submit" disabled={busyId === 'create-destination'} className="cta-primary w-full justify-center">{busyId === 'create-destination' ? 'Creating...' : 'Create destination'}</button>
                </form>
              ) : null}
              <div className="space-y-3">
                {destinations.map((destination) => (
                  <article key={destination.id} className="rounded-[16px] border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex gap-4">
                        <img src={destination.cover_image_url} alt={destination.name} className="h-20 w-28 rounded-[14px] object-cover" />
                        <div>
                          <p className="font-semibold text-slate-900">{destination.name}</p>
                          <p className="text-sm text-slate-600">{destination.region}</p>
                          <p className="mt-2 text-sm text-slate-700">{destination.short_summary}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="cta-secondary px-4 py-2" onClick={() => { setEditingDestinationId(destination.id); setShowDestinationForm(false); setDestinationForm(toDestinationForm(destination)); }}>Edit</button>
                        <button type="button" disabled={busyId === destination.id} className="cta-secondary px-4 py-2" onClick={() => void deleteDestination(destination.id)}>Delete</button>
                      </div>
                    </div>
                    {editingDestinationId === destination.id ? (
                      <form onSubmit={(event) => void updateDestination(event, destination.id)} className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
                        <input required placeholder="Name" value={destinationForm.name} onChange={(e) => setDestinationForm((p) => ({ ...p, name: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <input required placeholder="Short summary" value={destinationForm.short_summary} onChange={(e) => setDestinationForm((p) => ({ ...p, short_summary: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <textarea required rows={3} placeholder="Description" value={destinationForm.description} onChange={(e) => setDestinationForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <input required placeholder="Cover image URL" value={destinationForm.cover_image_url} onChange={(e) => setDestinationForm((p) => ({ ...p, cover_image_url: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <input required placeholder="Gallery image URLs (comma separated)" value={destinationForm.gallery_image_urls} onChange={(e) => setDestinationForm((p) => ({ ...p, gallery_image_urls: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <div className="flex gap-3">
                          <button type="submit" disabled={busyId === destination.id} className="cta-primary">{busyId === destination.id ? 'Saving...' : 'Save changes'}</button>
                          <button type="button" className="cta-secondary" onClick={() => { setEditingDestinationId(''); setDestinationForm(buildDestinationForm()); }}>Cancel</button>
                        </div>
                      </form>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {contentTab === 'packages' ? (
            <section className="premium-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-3xl text-slate-950 [font-family:var(--font-heading)]">
                  Package management
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPackageId('');
                    setPackageForm(buildPackageForm());
                    setShowPackageForm((current) => !current);
                  }}
                  className="cta-primary"
                >
                  {showPackageForm ? 'Close form' : 'Add package'}
                </button>
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
                    <input required placeholder="Stay style" value={packageForm.stay_style} onChange={(e) => setPackageForm((p) => ({ ...p, stay_style: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Difficulty level" value={packageForm.difficulty_level} onChange={(e) => setPackageForm((p) => ({ ...p, difficulty_level: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Cover image URL" value={packageForm.cover_image_url} onChange={(e) => setPackageForm((p) => ({ ...p, cover_image_url: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-2" />
                  </div>
                  <input required placeholder="Destinations (comma separated)" value={packageForm.destinations} onChange={(e) => setPackageForm((p) => ({ ...p, destinations: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Inclusions (comma separated)" value={packageForm.inclusions} onChange={(e) => setPackageForm((p) => ({ ...p, inclusions: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Exclusions (comma separated)" value={packageForm.exclusions} onChange={(e) => setPackageForm((p) => ({ ...p, exclusions: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Itinerary overview (comma separated)" value={packageForm.itinerary_overview} onChange={(e) => setPackageForm((p) => ({ ...p, itinerary_overview: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Gallery image URLs (comma separated)" value={packageForm.gallery_image_urls} onChange={(e) => setPackageForm((p) => ({ ...p, gallery_image_urls: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <input required placeholder="Summary" value={packageForm.summary} onChange={(e) => setPackageForm((p) => ({ ...p, summary: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <textarea required rows={3} placeholder="Description" value={packageForm.description} onChange={(e) => setPackageForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <textarea required rows={3} placeholder="Departure notes" value={packageForm.departure_notes} onChange={(e) => setPackageForm((p) => ({ ...p, departure_notes: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <button type="submit" disabled={busyId === 'create-package'} className="cta-primary w-full justify-center">{busyId === 'create-package' ? 'Creating...' : 'Create package'}</button>
                </form>
              ) : null}
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <article key={pkg.id} className="rounded-[16px] border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex gap-4">
                        <img src={pkg.cover_image_url} alt={pkg.title} className="h-20 w-28 rounded-[14px] object-cover" />
                        <div>
                          <p className="font-semibold text-slate-900">{pkg.title}</p>
                          <p className="text-sm text-slate-600">
                            {pkg.region} | {pkg.available_seats}/{pkg.total_seats} seats
                          </p>
                          <p className="mt-2 text-sm text-slate-700">{pkg.summary}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="cta-secondary px-4 py-2" onClick={() => { setEditingPackageId(pkg.id); setShowPackageForm(false); setPackageForm(toPackageForm(pkg)); }}>Edit</button>
                        <button type="button" disabled={busyId === pkg.id} className="cta-secondary px-4 py-2" onClick={() => void patchPackage(pkg, { is_active: !pkg.is_active })}>{pkg.is_active ? 'Disable' : 'Enable'}</button>
                        <button type="button" disabled={busyId === pkg.id} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700" onClick={() => void patchPackage(pkg, { is_active: false })}>Archive</button>
                      </div>
                    </div>
                    {editingPackageId === pkg.id ? (
                      <form onSubmit={(event) => void updatePackage(event, pkg.id)} className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
                        <input required placeholder="Title" value={packageForm.title} onChange={(e) => setPackageForm((p) => ({ ...p, title: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <input required placeholder="Summary" value={packageForm.summary} onChange={(e) => setPackageForm((p) => ({ ...p, summary: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <textarea required rows={3} placeholder="Description" value={packageForm.description} onChange={(e) => setPackageForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <input required placeholder="Cover image URL" value={packageForm.cover_image_url} onChange={(e) => setPackageForm((p) => ({ ...p, cover_image_url: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <input required placeholder="Gallery image URLs (comma separated)" value={packageForm.gallery_image_urls} onChange={(e) => setPackageForm((p) => ({ ...p, gallery_image_urls: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <textarea required rows={3} placeholder="Departure notes" value={packageForm.departure_notes} onChange={(e) => setPackageForm((p) => ({ ...p, departure_notes: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <div className="flex gap-3">
                          <button type="submit" disabled={busyId === pkg.id} className="cta-primary">{busyId === pkg.id ? 'Saving...' : 'Save changes'}</button>
                          <button type="button" className="cta-secondary" onClick={() => { setEditingPackageId(''); setPackageForm(buildPackageForm()); }}>Cancel</button>
                        </div>
                      </form>
                    ) : null}
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
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-slate-900">{item.full_name}</p>
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{item.id}</span>
                      </div>
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
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-slate-900">{item.full_name}</p>
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{item.id}</span>
                      </div>
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
