import { Booking, TourPackage } from '@prisma/client';

export type BookingResponse = Booking & {
  package: TourPackage;
};
