import { Module } from '@nestjs/common';
import { DestinationsModule } from './destinations/destinations.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, DestinationsModule, ItineraryModule],
})
export class AppModule {}