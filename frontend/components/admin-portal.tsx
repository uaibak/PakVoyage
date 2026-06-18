'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  csvToArray,
  ImageUploadField,
  ImageUrlPreview,
  OptionSelect,
  TagEditor,
} from '@/components/admin/admin-form-controls';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { AdminOperations, OpsTab } from '@/components/admin/admin-operations';
import {
  clearAdminToken,
  getAdminToken,
} from '@/lib/admin-auth';
import {
  createAdminDestination,
  createAdminPackage,
  deleteAdminDestination,
  fetchAdminData,
  updateAdminBookingStatus,
  updateAdminCustomRegistrationStatus,
  updateAdminDestination,
  updateAdminPackage,
  uploadAdminImages,
} from '@/lib/admin-api';
import {
  AdminBooking,
  AdminCustomRegistration,
  AdminDestination,
  AdminOverview,
  AdminPackage,
} from '@/lib/admin-types';
import { BookingStatus, PaymentStatus } from '@/lib/types';

type Section = 'overview' | 'content' | 'operations';
type ContentTab = 'destinations' | 'packages';

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
const regionOptions = [
  'Gilgit-Baltistan',
  'Khyber Pakhtunkhwa',
  'Punjab',
  'Sindh',
  'Balochistan',
  'Azad Kashmir',
  'Islamabad Capital Territory',
];
const bestTimeOptions = ['Spring', 'Summer', 'Autumn', 'Winter', 'All year'];
const packageTypeOptions = [
  'Adventure',
  'Family',
  'Group Tour',
  'Honeymoon',
  'Luxury',
  'Budget',
  'Weekend',
];
const stayStyleOptions = ['Hotel', 'Guest House', 'Resort', 'Camp', 'Mixed'];
const difficultyOptions = ['Easy', 'Moderate', 'Challenging'];
const idealForOptions = [
  'Families',
  'Couples',
  'Friends',
  'Solo travelers',
  'Photographers',
  'Food lovers',
  'Culture lovers',
  'Adventure seekers',
];
const inclusionPresets = [
  'Hotel stay',
  'Daily breakfast',
  'Private transport',
  'Tour guide',
  'Toll taxes',
  'Basic first aid',
];
const exclusionPresets = [
  'Personal expenses',
  'Entry tickets',
  'Lunch and dinner',
  'Porter charges',
  'Travel insurance',
  'Anything not mentioned in inclusions',
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
  const highlights = csvToArray(form.highlights);
  const travelTips = csvToArray(form.travel_tips);
  const idealFor = csvToArray(form.ideal_for);

  if (highlights.length === 0) {
    throw new Error('Add at least one destination highlight.');
  }

  if (travelTips.length === 0) {
    throw new Error('Add at least one travel tip.');
  }

  if (idealFor.length === 0) {
    throw new Error('Add at least one ideal traveler type.');
  }

  return {
    ...form,
    avg_cost_per_day: Number(form.avg_cost_per_day),
    highlights,
    travel_tips: travelTips,
    ideal_for: idealFor,
    gallery_image_urls: csvToArray(form.gallery_image_urls),
  };
}

function packagePayload(form: PackageFormState) {
  const destinations = csvToArray(form.destinations);
  const inclusions = csvToArray(form.inclusions);
  const exclusions = csvToArray(form.exclusions);
  const itineraryOverview = csvToArray(form.itinerary_overview);

  if (destinations.length === 0) {
    throw new Error('Add at least one package destination.');
  }

  if (inclusions.length === 0) {
    throw new Error('Add at least one package inclusion.');
  }

  if (exclusions.length === 0) {
    throw new Error('Add at least one package exclusion.');
  }

  if (itineraryOverview.length === 0) {
    throw new Error('Add at least one itinerary overview item.');
  }

  return {
    ...form,
    duration_days: Number(form.duration_days),
    price_per_seat: Number(form.price_per_seat),
    total_seats: Number(form.total_seats),
    available_seats: Number(form.available_seats),
    destinations,
    inclusions,
    exclusions,
    itinerary_overview: itineraryOverview,
  };
}

async function uploadImages(files: File[]): Promise<string[]> {
  return uploadAdminImages(files);
}

async function destinationPayloadWithImages(
  form: DestinationFormState,
  coverFile: File | null,
  galleryFiles: File[],
) {
  const [coverUploads, galleryUploads] = await Promise.all([
    uploadImages(coverFile ? [coverFile] : []),
    uploadImages(galleryFiles),
  ]);
  const coverImageUrl = coverUploads[0] ?? form.cover_image_url.trim();
  const galleryImageUrls = [
    ...csvToArray(form.gallery_image_urls),
    ...galleryUploads,
  ];

  if (!coverImageUrl) {
    throw new Error('Add a cover image URL or upload a cover image.');
  }

  if (galleryImageUrls.length === 0) {
    throw new Error('Add at least one gallery image URL or upload gallery images.');
  }

  return {
    ...destinationPayload(form),
    cover_image_url: coverImageUrl,
    gallery_image_urls: galleryImageUrls,
  };
}

async function packagePayloadWithImages(
  form: PackageFormState,
  coverFile: File | null,
  galleryFiles: File[],
) {
  const [coverUploads, galleryUploads] = await Promise.all([
    uploadImages(coverFile ? [coverFile] : []),
    uploadImages(galleryFiles),
  ]);
  const coverImageUrl = coverUploads[0] ?? form.cover_image_url.trim();
  const galleryImageUrls = [
    ...csvToArray(form.gallery_image_urls),
    ...galleryUploads,
  ];

  if (!coverImageUrl) {
    throw new Error('Add a cover image URL or upload a cover image.');
  }

  if (galleryImageUrls.length === 0) {
    throw new Error('Add at least one gallery image URL or upload gallery images.');
  }

  return {
    ...packagePayload(form),
    cover_image_url: coverImageUrl,
    gallery_image_urls: galleryImageUrls,
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
  const [contentSearch, setContentSearch] = useState<string>('');
  const [packageStatusFilter, setPackageStatusFilter] = useState<string>('all');
  const [opsStatusFilter, setOpsStatusFilter] = useState<string>('all');

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [customRegistrations, setCustomRegistrations] = useState<AdminCustomRegistration[]>([]);

  const [destinationForm, setDestinationForm] = useState<DestinationFormState>(
    buildDestinationForm(),
  );
  const [packageForm, setPackageForm] = useState<PackageFormState>(buildPackageForm());
  const [destinationCoverFile, setDestinationCoverFile] = useState<File | null>(null);
  const [destinationGalleryFiles, setDestinationGalleryFiles] = useState<File[]>([]);
  const [packageCoverFile, setPackageCoverFile] = useState<File | null>(null);
  const [packageGalleryFiles, setPackageGalleryFiles] = useState<File[]>([]);

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
      const data = await fetchAdminData();
      setAdminUsername(data.profile.username);
      setOverview(data.overview);
      setDestinations(data.destinations);
      setPackages(data.packages);
      setBookings(data.bookings);
      setCustomRegistrations(data.customRegistrations);
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
      const payload = await destinationPayloadWithImages(
        destinationForm,
        destinationCoverFile,
        destinationGalleryFiles,
      );
      await createAdminDestination(payload);
      setDestinationForm(buildDestinationForm());
      setDestinationCoverFile(null);
      setDestinationGalleryFiles([]);
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
      const payload = await destinationPayloadWithImages(
        destinationForm,
        destinationCoverFile,
        destinationGalleryFiles,
      );
      await updateAdminDestination(id, payload);
      setEditingDestinationId('');
      setDestinationForm(buildDestinationForm());
      setDestinationCoverFile(null);
      setDestinationGalleryFiles([]);
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
      const payload = await packagePayloadWithImages(
        packageForm,
        packageCoverFile,
        packageGalleryFiles,
      );
      await createAdminPackage({
        ...payload,
        is_active: true,
      });
      setPackageForm(buildPackageForm());
      setPackageCoverFile(null);
      setPackageGalleryFiles([]);
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
      const payload = await packagePayloadWithImages(
        packageForm,
        packageCoverFile,
        packageGalleryFiles,
      );
      await updateAdminPackage(id, payload);
      setEditingPackageId('');
      setPackageForm(buildPackageForm());
      setPackageCoverFile(null);
      setPackageGalleryFiles([]);
      setSuccess('Tour package updated successfully.');
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update package.');
    } finally {
      setBusyId('');
    }
  };

  const patchBookingStatus = async (
    id: string,
    status: BookingStatus,
    paymentStatus?: PaymentStatus,
    paymentReference?: string,
  ): Promise<void> => {
    setBusyId(id);
    setError('');
    setSuccess('');
    try {
      await updateAdminBookingStatus(id, status, paymentStatus, paymentReference);
      setSuccess(`Booking ${id} updated.`);
      await refreshAll(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update booking status.');
    } finally {
      setBusyId('');
    }
  };

  const patchCustomStatus = async (
    id: string,
    status: BookingStatus,
    paymentStatus?: PaymentStatus,
    paymentReference?: string,
  ): Promise<void> => {
    setBusyId(id);
    setError('');
    setSuccess('');
    try {
      await updateAdminCustomRegistrationStatus(
        id,
        status,
        paymentStatus,
        paymentReference,
      );
      setSuccess(`Registration ${id} updated.`);
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
      await updateAdminPackage(pkg.id, patch);
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
      await deleteAdminDestination(id);
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
  const filteredDestinations = destinations.filter((destination) => {
    const query = contentSearch.toLowerCase().trim();
    if (!query) return true;
    return [destination.name, destination.region, destination.short_summary]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
  const filteredPackages = packages.filter((pkg) => {
    const query = contentSearch.toLowerCase().trim();
    const matchesQuery =
      !query ||
      [pkg.title, pkg.region, pkg.summary, pkg.package_type]
        .join(' ')
        .toLowerCase()
        .includes(query);
    const matchesStatus =
      packageStatusFilter === 'all' ||
      (packageStatusFilter === 'active' && pkg.is_active) ||
      (packageStatusFilter === 'inactive' && !pkg.is_active);

    return matchesQuery && matchesStatus;
  });
  const filteredBookings = bookings.filter(
    (item) => opsStatusFilter === 'all' || item.status === opsStatusFilter,
  );
  const filteredCustomRegistrations = customRegistrations.filter(
    (item) => opsStatusFilter === 'all' || item.status === opsStatusFilter,
  );
  const pendingBookings = bookings
    .filter((item) => item.status === 'PENDING')
    .slice(0, 4);
  const pendingCustomTrips = customRegistrations
    .filter((item) => item.status === 'PENDING')
    .slice(0, 4);
  const lowSeatPackages = packages
    .filter((pkg) => pkg.is_active && pkg.available_seats <= 3)
    .slice(0, 4);

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
      {success ? (
        <p className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </p>
      ) : null}
      {loading ? (
        <div className="premium-card p-6 text-sm text-slate-600">Loading admin data...</div>
      ) : null}

      {!loading && section === 'overview' ? (
        <AdminDashboard
          overview={overview}
          summary={summary}
          pendingBookings={pendingBookings}
          pendingCustomTrips={pendingCustomTrips}
          lowSeatPackages={lowSeatPackages}
        />
      ) : null}

      {!loading && section === 'content' ? (
        <div className="space-y-4">
          <section className="premium-card p-4">
            <div className="flex flex-wrap items-center gap-2">
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
              <input
                type="search"
                placeholder="Search admin content"
                value={contentSearch}
                onChange={(event) => setContentSearch(event.target.value)}
                className="ml-auto min-w-[220px] rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
              />
              {contentTab === 'packages' ? (
                <select
                  value={packageStatusFilter}
                  onChange={(event) => setPackageStatusFilter(event.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
                >
                  <option value="all">All packages</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              ) : null}
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
                    setDestinationCoverFile(null);
                    setDestinationGalleryFiles([]);
                    setShowDestinationForm((current) => !current);
                  }}
                  className="cta-primary"
                >
                  {showDestinationForm ? 'Close form' : 'Add destination'}
                </button>
              </div>
              {showDestinationForm ? (
                <form noValidate onSubmit={createDestination} className="grid gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input required placeholder="Name" value={destinationForm.name} onChange={(e) => setDestinationForm((p) => ({ ...p, name: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <OptionSelect value={destinationForm.region} options={regionOptions} placeholder="Region" onChange={(value) => setDestinationForm((p) => ({ ...p, region: value }))} />
                    <OptionSelect value={destinationForm.best_time} options={bestTimeOptions} placeholder="Best time" onChange={(value) => setDestinationForm((p) => ({ ...p, best_time: value }))} />
                    <input required type="number" min={0} placeholder="Average cost per day" value={destinationForm.avg_cost_per_day} onChange={(e) => setDestinationForm((p) => ({ ...p, avg_cost_per_day: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Short summary" value={destinationForm.short_summary} onChange={(e) => setDestinationForm((p) => ({ ...p, short_summary: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-2" />
                    <input required={!destinationCoverFile} placeholder="Cover image URL" value={destinationForm.cover_image_url} onChange={(e) => setDestinationForm((p) => ({ ...p, cover_image_url: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-2" />
                  </div>
                  <ImageUrlPreview urls={destinationForm.cover_image_url.trim() ? [destinationForm.cover_image_url.trim()] : []} />
                  <ImageUploadField files={destinationCoverFile ? [destinationCoverFile] : []} onChange={(files) => setDestinationCoverFile(files[0] ?? null)} />
                  <textarea required rows={3} placeholder="Description" value={destinationForm.description} onChange={(e) => setDestinationForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <TagEditor placeholder="Add highlight" value={destinationForm.highlights} onChange={(value) => setDestinationForm((p) => ({ ...p, highlights: value }))} />
                  <TagEditor placeholder="Add travel tip" value={destinationForm.travel_tips} onChange={(value) => setDestinationForm((p) => ({ ...p, travel_tips: value }))} />
                  <TagEditor placeholder="Add ideal traveler" value={destinationForm.ideal_for} presets={idealForOptions} onChange={(value) => setDestinationForm((p) => ({ ...p, ideal_for: value }))} />
                  <input required={destinationGalleryFiles.length === 0} placeholder="Gallery image URLs (comma separated)" value={destinationForm.gallery_image_urls} onChange={(e) => setDestinationForm((p) => ({ ...p, gallery_image_urls: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <ImageUrlPreview urls={csvToArray(destinationForm.gallery_image_urls)} />
                  <ImageUploadField multiple files={destinationGalleryFiles} onChange={setDestinationGalleryFiles} />
                  <button type="submit" disabled={busyId === 'create-destination'} className="cta-primary w-full justify-center">{busyId === 'create-destination' ? 'Creating...' : 'Create destination'}</button>
                </form>
              ) : null}
              <div className="space-y-3">
                {filteredDestinations.map((destination) => (
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
                        <button type="button" className="cta-secondary px-4 py-2" onClick={() => { setEditingDestinationId(destination.id); setShowDestinationForm(false); setDestinationForm(toDestinationForm(destination)); setDestinationCoverFile(null); setDestinationGalleryFiles([]); }}>Edit</button>
                        <button type="button" disabled={busyId === destination.id} className="cta-secondary px-4 py-2" onClick={() => void deleteDestination(destination.id)}>Delete</button>
                      </div>
                    </div>
                    {editingDestinationId === destination.id ? (
                      <form noValidate onSubmit={(event) => void updateDestination(event, destination.id)} className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
                        <input required placeholder="Name" value={destinationForm.name} onChange={(e) => setDestinationForm((p) => ({ ...p, name: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <OptionSelect value={destinationForm.region} options={regionOptions} placeholder="Region" onChange={(value) => setDestinationForm((p) => ({ ...p, region: value }))} />
                        <OptionSelect value={destinationForm.best_time} options={bestTimeOptions} placeholder="Best time" onChange={(value) => setDestinationForm((p) => ({ ...p, best_time: value }))} />
                        <input required placeholder="Short summary" value={destinationForm.short_summary} onChange={(e) => setDestinationForm((p) => ({ ...p, short_summary: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <textarea required rows={3} placeholder="Description" value={destinationForm.description} onChange={(e) => setDestinationForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <input required={!destinationCoverFile} placeholder="Cover image URL" value={destinationForm.cover_image_url} onChange={(e) => setDestinationForm((p) => ({ ...p, cover_image_url: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <ImageUrlPreview urls={destinationForm.cover_image_url.trim() ? [destinationForm.cover_image_url.trim()] : []} />
                        <ImageUploadField files={destinationCoverFile ? [destinationCoverFile] : []} onChange={(files) => setDestinationCoverFile(files[0] ?? null)} />
                        <TagEditor placeholder="Add highlight" value={destinationForm.highlights} onChange={(value) => setDestinationForm((p) => ({ ...p, highlights: value }))} />
                        <TagEditor placeholder="Add travel tip" value={destinationForm.travel_tips} onChange={(value) => setDestinationForm((p) => ({ ...p, travel_tips: value }))} />
                        <TagEditor placeholder="Add ideal traveler" value={destinationForm.ideal_for} presets={idealForOptions} onChange={(value) => setDestinationForm((p) => ({ ...p, ideal_for: value }))} />
                        <input required={destinationGalleryFiles.length === 0} placeholder="Gallery image URLs (comma separated)" value={destinationForm.gallery_image_urls} onChange={(e) => setDestinationForm((p) => ({ ...p, gallery_image_urls: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <ImageUrlPreview urls={csvToArray(destinationForm.gallery_image_urls)} />
                        <ImageUploadField multiple files={destinationGalleryFiles} onChange={setDestinationGalleryFiles} />
                        <div className="flex gap-3">
                          <button type="submit" disabled={busyId === destination.id} className="cta-primary">{busyId === destination.id ? 'Saving...' : 'Save changes'}</button>
                          <button type="button" className="cta-secondary" onClick={() => { setEditingDestinationId(''); setDestinationForm(buildDestinationForm()); setDestinationCoverFile(null); setDestinationGalleryFiles([]); }}>Cancel</button>
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
                    setPackageCoverFile(null);
                    setPackageGalleryFiles([]);
                    setShowPackageForm((current) => !current);
                  }}
                  className="cta-primary"
                >
                  {showPackageForm ? 'Close form' : 'Add package'}
                </button>
              </div>
              {showPackageForm ? (
                <form noValidate onSubmit={createPackage} className="grid gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input required placeholder="Title" value={packageForm.title} onChange={(e) => {
                      const title = e.target.value;
                      setPackageForm((p) => ({
                        ...p,
                        title,
                        slug: !p.slug || p.slug === slugify(p.title) ? slugify(title) : p.slug,
                      }));
                    }} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Slug" value={packageForm.slug} onChange={(e) => setPackageForm((p) => ({ ...p, slug: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <OptionSelect value={packageForm.region} options={regionOptions} placeholder="Region" onChange={(value) => setPackageForm((p) => ({ ...p, region: value }))} />
                    <input required type="date" value={packageForm.travel_date} onChange={(e) => setPackageForm((p) => ({ ...p, travel_date: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="number" min={1} placeholder="Duration days" value={packageForm.duration_days} onChange={(e) => setPackageForm((p) => ({ ...p, duration_days: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="number" min={0} placeholder="Price per seat" value={packageForm.price_per_seat} onChange={(e) => setPackageForm((p) => ({ ...p, price_per_seat: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="number" min={1} placeholder="Total seats" value={packageForm.total_seats} onChange={(e) => setPackageForm((p) => ({ ...p, total_seats: e.target.value, available_seats: p.available_seats || e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input required type="number" min={0} placeholder="Available seats" value={packageForm.available_seats} onChange={(e) => setPackageForm((p) => ({ ...p, available_seats: e.target.value }))} className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                    <input required placeholder="Pickup city" value={packageForm.pickup_city} onChange={(e) => setPackageForm((p) => ({ ...p, pickup_city: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <OptionSelect value={packageForm.package_type} options={packageTypeOptions} placeholder="Package type" onChange={(value) => setPackageForm((p) => ({ ...p, package_type: value }))} />
                    <OptionSelect value={packageForm.stay_style} options={stayStyleOptions} placeholder="Stay style" onChange={(value) => setPackageForm((p) => ({ ...p, stay_style: value }))} />
                    <OptionSelect value={packageForm.difficulty_level} options={difficultyOptions} placeholder="Difficulty level" onChange={(value) => setPackageForm((p) => ({ ...p, difficulty_level: value }))} />
                    <input required={!packageCoverFile} placeholder="Cover image URL" value={packageForm.cover_image_url} onChange={(e) => setPackageForm((p) => ({ ...p, cover_image_url: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-2" />
                  </div>
                  <ImageUrlPreview urls={packageForm.cover_image_url.trim() ? [packageForm.cover_image_url.trim()] : []} />
                  <ImageUploadField files={packageCoverFile ? [packageCoverFile] : []} onChange={(files) => setPackageCoverFile(files[0] ?? null)} />
                  <TagEditor placeholder="Add destination stop" value={packageForm.destinations} onChange={(value) => setPackageForm((p) => ({ ...p, destinations: value }))} />
                  <TagEditor placeholder="Add inclusion" value={packageForm.inclusions} presets={inclusionPresets} onChange={(value) => setPackageForm((p) => ({ ...p, inclusions: value }))} />
                  <TagEditor placeholder="Add exclusion" value={packageForm.exclusions} presets={exclusionPresets} onChange={(value) => setPackageForm((p) => ({ ...p, exclusions: value }))} />
                  <TagEditor placeholder="Add itinerary day/step" value={packageForm.itinerary_overview} onChange={(value) => setPackageForm((p) => ({ ...p, itinerary_overview: value }))} />
                  <input required={packageGalleryFiles.length === 0} placeholder="Gallery image URLs (comma separated)" value={packageForm.gallery_image_urls} onChange={(e) => setPackageForm((p) => ({ ...p, gallery_image_urls: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <ImageUrlPreview urls={csvToArray(packageForm.gallery_image_urls)} />
                  <ImageUploadField multiple files={packageGalleryFiles} onChange={setPackageGalleryFiles} />
                  <input required placeholder="Summary" value={packageForm.summary} onChange={(e) => setPackageForm((p) => ({ ...p, summary: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <textarea required rows={3} placeholder="Description" value={packageForm.description} onChange={(e) => setPackageForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <textarea required rows={3} placeholder="Departure notes" value={packageForm.departure_notes} onChange={(e) => setPackageForm((p) => ({ ...p, departure_notes: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                  <button type="submit" disabled={busyId === 'create-package'} className="cta-primary w-full justify-center">{busyId === 'create-package' ? 'Creating...' : 'Create package'}</button>
                </form>
              ) : null}
              <div className="space-y-3">
                {filteredPackages.map((pkg) => (
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
                        <button type="button" className="cta-secondary px-4 py-2" onClick={() => { setEditingPackageId(pkg.id); setShowPackageForm(false); setPackageForm(toPackageForm(pkg)); setPackageCoverFile(null); setPackageGalleryFiles([]); }}>Edit</button>
                        <button type="button" disabled={busyId === pkg.id} className="cta-secondary px-4 py-2" onClick={() => void patchPackage(pkg, { is_active: !pkg.is_active })}>{pkg.is_active ? 'Disable' : 'Enable'}</button>
                        <button type="button" disabled={busyId === pkg.id} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700" onClick={() => void patchPackage(pkg, { is_active: false })}>Archive</button>
                      </div>
                    </div>
                    {editingPackageId === pkg.id ? (
                      <form noValidate onSubmit={(event) => void updatePackage(event, pkg.id)} className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
                        <input required placeholder="Title" value={packageForm.title} onChange={(e) => setPackageForm((p) => ({ ...p, title: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <input required placeholder="Slug" value={packageForm.slug} onChange={(e) => setPackageForm((p) => ({ ...p, slug: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <OptionSelect value={packageForm.region} options={regionOptions} placeholder="Region" onChange={(value) => setPackageForm((p) => ({ ...p, region: value }))} />
                        <OptionSelect value={packageForm.package_type} options={packageTypeOptions} placeholder="Package type" onChange={(value) => setPackageForm((p) => ({ ...p, package_type: value }))} />
                        <OptionSelect value={packageForm.stay_style} options={stayStyleOptions} placeholder="Stay style" onChange={(value) => setPackageForm((p) => ({ ...p, stay_style: value }))} />
                        <OptionSelect value={packageForm.difficulty_level} options={difficultyOptions} placeholder="Difficulty level" onChange={(value) => setPackageForm((p) => ({ ...p, difficulty_level: value }))} />
                        <input required placeholder="Summary" value={packageForm.summary} onChange={(e) => setPackageForm((p) => ({ ...p, summary: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <textarea required rows={3} placeholder="Description" value={packageForm.description} onChange={(e) => setPackageForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <input required={!packageCoverFile} placeholder="Cover image URL" value={packageForm.cover_image_url} onChange={(e) => setPackageForm((p) => ({ ...p, cover_image_url: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <ImageUrlPreview urls={packageForm.cover_image_url.trim() ? [packageForm.cover_image_url.trim()] : []} />
                        <ImageUploadField files={packageCoverFile ? [packageCoverFile] : []} onChange={(files) => setPackageCoverFile(files[0] ?? null)} />
                        <TagEditor placeholder="Add destination stop" value={packageForm.destinations} onChange={(value) => setPackageForm((p) => ({ ...p, destinations: value }))} />
                        <TagEditor placeholder="Add inclusion" value={packageForm.inclusions} presets={inclusionPresets} onChange={(value) => setPackageForm((p) => ({ ...p, inclusions: value }))} />
                        <TagEditor placeholder="Add exclusion" value={packageForm.exclusions} presets={exclusionPresets} onChange={(value) => setPackageForm((p) => ({ ...p, exclusions: value }))} />
                        <TagEditor placeholder="Add itinerary day/step" value={packageForm.itinerary_overview} onChange={(value) => setPackageForm((p) => ({ ...p, itinerary_overview: value }))} />
                        <input required={packageGalleryFiles.length === 0} placeholder="Gallery image URLs (comma separated)" value={packageForm.gallery_image_urls} onChange={(e) => setPackageForm((p) => ({ ...p, gallery_image_urls: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <ImageUrlPreview urls={csvToArray(packageForm.gallery_image_urls)} />
                        <ImageUploadField multiple files={packageGalleryFiles} onChange={setPackageGalleryFiles} />
                        <textarea required rows={3} placeholder="Departure notes" value={packageForm.departure_notes} onChange={(e) => setPackageForm((p) => ({ ...p, departure_notes: e.target.value }))} className="rounded-[14px] border border-slate-200 px-4 py-3 text-sm outline-none" />
                        <div className="flex gap-3">
                          <button type="submit" disabled={busyId === pkg.id} className="cta-primary">{busyId === pkg.id ? 'Saving...' : 'Save changes'}</button>
                          <button type="button" className="cta-secondary" onClick={() => { setEditingPackageId(''); setPackageForm(buildPackageForm()); setPackageCoverFile(null); setPackageGalleryFiles([]); }}>Cancel</button>
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
        <AdminOperations
          opsTab={opsTab}
          setOpsTab={setOpsTab}
          opsStatusFilter={opsStatusFilter}
          setOpsStatusFilter={setOpsStatusFilter}
          statuses={statuses}
          bookings={filteredBookings}
          customRegistrations={filteredCustomRegistrations}
          busyId={busyId}
          patchBookingStatus={(id, status, paymentStatus, paymentReference) =>
            void patchBookingStatus(id, status, paymentStatus, paymentReference)
          }
          patchCustomStatus={(id, status, paymentStatus, paymentReference) =>
            void patchCustomStatus(id, status, paymentStatus, paymentReference)
          }
        />
      ) : null}
    </div>
  );
}
