import { Booking, TourPackage } from '@prisma/client';
import { PricingQuote } from '../pricing/pricing.types';

export type BookingResponse = Booking & {
  package: TourPackage;
  pricing?: PricingQuote;
};
