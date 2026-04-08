export type TravelInterest = 'mountains' | 'culture' | 'food';

export interface Destination {
  id: string;
  name: string;
  region: string;
  description: string;
  best_time: string;
  avg_cost_per_day: number;
}

export interface GeneratedItineraryDay {
  day_number: number;
  destination: Destination;
  activities: string;
  cost: number;
}

export interface GeneratedItinerary {
  trip_summary: string;
  destinations: Destination[];
  itinerary_days: GeneratedItineraryDay[];
  cost_breakdown: {
    hotel: number;
    transport: number;
    food: number;
    total: number;
    is_within_budget: boolean;
  };
}

export interface TripRequest {
  days: number;
  budget: number;
  interests: TravelInterest[];
}

export interface SavedItineraryDay {
  id: string;
  day_number: number;
  destination_id: string;
  itinerary_id: string;
  activities: string;
  cost: number;
  destination: Destination;
}

export interface SavedItinerary {
  id: string;
  user_id: string | null;
  days: number;
  budget: number;
  interests: TravelInterest[];
  total_cost: number;
  hotel_cost: number;
  transport_cost: number;
  food_cost: number;
  created_at: string;
  itinerary_days: SavedItineraryDay[];
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  region: string;
  summary: string;
  description: string;
  travel_date: string;
  duration_days: number;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  pickup_city: string;
  package_type: string;
  destinations: string[];
  inclusions: string[];
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  package_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  national_id: string | null;
  seats: number;
  status: BookingStatus;
  total_amount: number;
  special_requests: string | null;
  created_at: string;
  package: TourPackage;
}

export interface CreateBookingRequest {
  package_id: string;
  full_name: string;
  email: string;
  phone: string;
  national_id?: string;
  seats: number;
  special_requests?: string;
}

export interface CustomTripRegistration {
  id: string;
  itinerary_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  seats: number;
  days: number;
  budget: number;
  interests: TravelInterest[];
  trip_summary: string;
  destinations: string[];
  estimated_total: number;
  status: BookingStatus;
  special_requests: string | null;
  created_at: string;
}
