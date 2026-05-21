import { apiBaseUrl } from './api';
import { parseApiError } from './api-error';
import { adminFetch, getAdminProfile } from './admin-auth';
import {
  AdminBooking,
  AdminCustomRegistration,
  AdminDestination,
  AdminOverview,
  AdminPackage,
} from './admin-types';
import { BookingStatus } from './types';

export interface AdminData {
  profile: {
    username: string;
  };
  overview: AdminOverview;
  destinations: AdminDestination[];
  packages: AdminPackage[];
  bookings: AdminBooking[];
  customRegistrations: AdminCustomRegistration[];
}

export async function fetchAdminData(): Promise<AdminData> {
  const profile = await getAdminProfile();
  const [overview, destinations, packages, bookings, customRegistrations] =
    await Promise.all([
      getJson<AdminOverview>('/admin/overview'),
      getJson<AdminDestination[]>('/admin/destinations'),
      getJson<AdminPackage[]>('/admin/packages?include_inactive=true'),
      getJson<AdminBooking[]>('/admin/bookings'),
      getJson<AdminCustomRegistration[]>('/admin/custom-registrations'),
    ]);

  return {
    profile,
    overview,
    destinations,
    packages,
    bookings,
    customRegistrations,
  };
}

export async function uploadAdminImages(files: File[]): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await adminFetch(`${apiBaseUrl}/admin/uploads`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return ((await response.json()) as { urls: string[] }).urls;
}

export async function createAdminDestination(payload: unknown): Promise<AdminDestination> {
  return sendJson<AdminDestination>('/admin/destinations', 'POST', payload);
}

export async function updateAdminDestination(
  id: string,
  payload: unknown,
): Promise<AdminDestination> {
  return sendJson<AdminDestination>(`/admin/destinations/${id}`, 'PATCH', payload);
}

export async function deleteAdminDestination(id: string): Promise<{ deleted: true }> {
  return sendJson<{ deleted: true }>(`/admin/destinations/${id}`, 'DELETE');
}

export async function createAdminPackage(payload: unknown): Promise<AdminPackage> {
  return sendJson<AdminPackage>('/admin/packages', 'POST', payload);
}

export async function updateAdminPackage(
  id: string,
  payload: unknown,
): Promise<AdminPackage> {
  return sendJson<AdminPackage>(`/admin/packages/${id}`, 'PATCH', payload);
}

export async function updateAdminBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<AdminBooking> {
  return sendJson<AdminBooking>(`/admin/bookings/${id}/status`, 'PATCH', { status });
}

export async function updateAdminCustomRegistrationStatus(
  id: string,
  status: BookingStatus,
): Promise<AdminCustomRegistration> {
  return sendJson<AdminCustomRegistration>(
    `/admin/custom-registrations/${id}/status`,
    'PATCH',
    { status },
  );
}

async function getJson<T>(path: string): Promise<T> {
  const response = await adminFetch(`${apiBaseUrl}${path}`, { cache: 'no-store' });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as T;
}

async function sendJson<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  payload?: unknown,
): Promise<T> {
  const response = await adminFetch(`${apiBaseUrl}${path}`, {
    method,
    headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as T;
}
