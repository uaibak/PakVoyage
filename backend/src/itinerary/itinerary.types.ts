import {
  Destination,
  Itinerary,
  ItineraryDay,
} from '@prisma/client';

export interface GeneratedItineraryDay {
  day_number: number;
  destination: Destination;
  activities: string;
  cost: number;
}

export interface GeneratedCostBreakdown {
  hotel: number;
  transport: number;
  food: number;
  total: number;
  is_within_budget: boolean;
}

export interface GeneratedItineraryResponse {
  trip_summary: string;
  destinations: Destination[];
  itinerary_days: GeneratedItineraryDay[];
  cost_breakdown: GeneratedCostBreakdown;
}

export interface SavedItineraryResponse extends Itinerary {
  itinerary_days: (ItineraryDay & { destination: Destination })[];
}

export interface CustomTripRegistrationResponse {
  id: string;
  itinerary_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  seats: number;
  days: number;
  budget: number;
  interests: string[];
  trip_summary: string;
  destinations: string[];
  estimated_total: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  special_requests: string | null;
  created_at: Date;
}
