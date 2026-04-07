import { Destination, Itinerary, ItineraryDay } from '@prisma/client';

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
