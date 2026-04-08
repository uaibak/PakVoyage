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
  seats: number;
  status: BookingStatus;
  total_amount: number;
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
  seats: number;
  budget: number;
  estimated_total: number;
  status: BookingStatus;
  created_at: string;
}
