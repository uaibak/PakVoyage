import {
  Destination,
  Itinerary,
  ItineraryDay,
} from '@prisma/client';
import { PricingQuote } from '../pricing/pricing.types';

export interface GeneratedItineraryDay {
  day_number: number;
  destination: Destination;
  activities: string;
  cost: number;
  pricing: PricingQuote;
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
  pricing: PricingQuote;
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
  national_id: string;
  seats: number;
  days: number;
  budget: number;
  interests: string[];
  trip_summary: string;
  destinations: string[];
  estimated_total: number;
  pricing_market: 'LOCAL_PK' | 'CHINA' | 'INTERNATIONAL';
  display_currency: 'PKR' | 'USD' | 'CNY' | 'GBP' | 'AED' | 'SAR' | 'EUR';
  exchange_rate: number;
  display_total: number | null;
  security_cost: number;
  service_cost: number;
  payment_status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  payment_reference: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  special_requests: string | null;
  created_at: Date;
}
