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
