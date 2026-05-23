import { Module } from '@nestjs/common';
import { DestinationsModule } from './destinations/destinations.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { PrismaModule } from './prisma/prisma.module';
import { PackagesModule } from './packages/packages.module';
import { BookingsModule } from './bookings/bookings.module';
import { AdminModule } from './admin/admin.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [
    PrismaModule,
    DestinationsModule,
    ItineraryModule,
    PackagesModule,
    BookingsModule,
    AdminModule,
    PricingModule,
  ],
})
export class AppModule {}
