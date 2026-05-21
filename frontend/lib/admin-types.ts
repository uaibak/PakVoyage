import { BookingStatus, Destination, TourPackage } from './types';

export interface AdminOverview {
  destinations_count: number;
  packages_count: number;
  active_packages_count: number;
  bookings_count: number;
  pending_bookings_count: number;
  custom_trip_registrations_count: number;
  pending_custom_registrations_count: number;
  confirmed_revenue: number;
}

export type AdminDestination = Destination;

export type AdminPackage = TourPackage;

export interface AdminBooking {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  national_id: string;
  seats: number;
  status: BookingStatus;
  total_amount: number;
  special_requests: string | null;
  created_at: string;
  package: {
    id: string;
    title: string;
    travel_date: string;
  };
}

export interface AdminCustomRegistration {
  id: string;
  itinerary_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  national_id: string;
  seats: number;
  days: number;
  budget: number;
  interests: string[];
  trip_summary: string;
  destinations: string[];
  estimated_total: number;
  status: BookingStatus;
  special_requests: string | null;
  created_at: string;
}
