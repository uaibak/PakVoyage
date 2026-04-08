import { Injectable, NotFoundException } from '@nestjs/common';
import { Destination } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
import { RegisterCustomTripDto } from './dto/register-custom-trip.dto';
import { SaveItineraryDto } from './dto/save-itinerary.dto';
import {
  CustomTripRegistrationResponse,
  GeneratedItineraryDay,
  GeneratedItineraryResponse,
  SavedItineraryResponse,
} from './itinerary.types';
import { TravelInterest } from './travel-interest.enum';

type DestinationName =
  | 'Hunza'
  | 'Skardu'
  | 'Lahore'
  | 'Islamabad'
  | 'Swat Valley'
  | 'Karachi';

@Injectable()
export class ItineraryService {
  constructor(private readonly prisma: PrismaService) {}

  async generateItinerary(
    dto: GenerateItineraryDto,
  ): Promise<GeneratedItineraryResponse> {
    const destinations = await this.prisma.destination.findMany({
      orderBy: { avg_cost_per_day: 'asc' },
    });

    if (destinations.length === 0) {
      throw new NotFoundException('No destinations are available to build an itinerary.');
    }

    const selectedDestinations = this.pickDestinations(destinations, dto);
    const daysPerDestination = this.splitDays(dto.days, selectedDestinations.length);

    const itineraryDays = selectedDestinations.flatMap((destination, index) =>
      this.buildDaysForDestination(
        destination,
        daysPerDestination[index],
        daysPerDestination
          .slice(0, index)
          .reduce((total, current) => total + current, 0) + 1,
      ),
    );

    const hotelCost = itineraryDays.reduce((total, day) => total + day.cost, 0);
    const transportCost = this.calculateTransportCost(selectedDestinations.length);
    const foodCost = dto.days * 1800;
    const totalCost = hotelCost + transportCost + foodCost;

    return {
      trip_summary: this.buildSummary(selectedDestinations, dto.days, dto.interests),
      destinations: selectedDestinations,
      itinerary_days: itineraryDays,
      cost_breakdown: {
        hotel: hotelCost,
        transport: transportCost,
        food: foodCost,
        total: totalCost,
        is_within_budget: totalCost <= dto.budget,
      },
    };
  }

  async saveItinerary(dto: SaveItineraryDto): Promise<SavedItineraryResponse> {
    const itinerary = await this.prisma.itinerary.create({
      data: {
        user_id: dto.user_id,
        days: dto.days,
        budget: dto.budget,
        interests: dto.interests,
        total_cost: dto.total_cost,
        hotel_cost: dto.hotel_cost,
        transport_cost: dto.transport_cost,
        food_cost: dto.food_cost,
        itinerary_days: {
          create: dto.itinerary_days.map((day) => ({
            day_number: day.day_number,
            destination_id: day.destination_id,
            activities: day.activities,
            cost: day.cost,
          })),
        },
      },
      include: {
        itinerary_days: {
          include: {
            destination: true,
          },
          orderBy: {
            day_number: 'asc',
          },
        },
      },
    });

    return itinerary;
  }

  async registerCustomTrip(
    dto: RegisterCustomTripDto,
  ): Promise<CustomTripRegistrationResponse> {
    if (dto.itinerary_id) {
      const itinerary = await this.prisma.itinerary.findUnique({
        where: {
          id: dto.itinerary_id,
        },
        select: { id: true },
      });

      if (!itinerary) {
        throw new NotFoundException(
          `Itinerary with ID "${dto.itinerary_id}" was not found.`,
        );
      }
    }

    const prismaWithCustomRegistration = this.prisma as PrismaService & {
      customTripRegistration: {
        create: (args: {
          data: {
            itinerary_id?: string;
            full_name: string;
            email: string;
            phone: string;
            national_id: string;
            seats: number;
            days: number;
            budget: number;
            interests: TravelInterest[];
            trip_summary: string;
            destinations: string[];
            estimated_total: number;
            special_requests?: string;
          };
        }) => Promise<CustomTripRegistrationResponse>;
      };
    };

    return prismaWithCustomRegistration.customTripRegistration.create({
      data: {
        itinerary_id: dto.itinerary_id,
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        national_id: dto.national_id,
        seats: dto.seats,
        days: dto.days,
        budget: dto.budget,
        interests: dto.interests,
        trip_summary: dto.trip_summary,
        destinations: dto.destinations,
        estimated_total: dto.estimated_total,
        special_requests: dto.special_requests,
      },
    });
  }

  async findOne(id: string): Promise<SavedItineraryResponse> {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: {
        itinerary_days: {
          include: {
            destination: true,
          },
          orderBy: {
            day_number: 'asc',
          },
        },
      },
    });

    if (!itinerary) {
      throw new NotFoundException(`Itinerary with ID "${id}" was not found.`);
    }

    return itinerary;
  }

  private pickDestinations(
    destinations: Destination[],
    dto: GenerateItineraryDto,
  ): Destination[] {
    const preferredNames = this.buildPriorityList(dto.interests);
    const destinationCount = this.getDestinationCount(dto.days);

    const priorityMatches = preferredNames
      .map((name) => destinations.find((destination) => destination.name === name))
      .filter((destination): destination is Destination => Boolean(destination));

    const fillerDestinations = destinations.filter(
      (destination) => !priorityMatches.some((match) => match.id === destination.id),
    );

    const combined = [...priorityMatches, ...fillerDestinations];
    return combined.slice(0, Math.min(destinationCount, combined.length));
  }

  private buildPriorityList(interests: TravelInterest[]): DestinationName[] {
    const hasMountains = interests.includes(TravelInterest.Mountains);
    const hasCulture = interests.includes(TravelInterest.Culture);
    const hasFood = interests.includes(TravelInterest.Food);

    if (hasMountains && hasCulture) {
      return ['Islamabad', 'Hunza', 'Lahore', 'Skardu', 'Swat Valley', 'Karachi'];
    }

    if (hasMountains) {
      return ['Hunza', 'Skardu', 'Swat Valley', 'Islamabad', 'Lahore', 'Karachi'];
    }

    if (hasCulture || hasFood) {
      return ['Lahore', 'Islamabad', 'Karachi', 'Hunza', 'Swat Valley', 'Skardu'];
    }

    return ['Islamabad', 'Hunza', 'Lahore', 'Skardu', 'Swat Valley', 'Karachi'];
  }

  private getDestinationCount(days: number): number {
    if (days <= 5) {
      return 1;
    }

    if (days <= 7) {
      return 2;
    }

    return 3;
  }

  private splitDays(totalDays: number, destinationCount: number): number[] {
    const baseDays = Math.floor(totalDays / destinationCount);
    const remainder = totalDays % destinationCount;

    return Array.from({ length: destinationCount }, (_, index) =>
      baseDays + (index < remainder ? 1 : 0),
    );
  }

  private buildDaysForDestination(
    destination: Destination,
    daysAtDestination: number,
    firstDayNumber: number,
  ): GeneratedItineraryDay[] {
    const activityTemplates = this.getActivities(destination.name);

    return Array.from({ length: daysAtDestination }, (_, index) => ({
      day_number: firstDayNumber + index,
      destination,
      activities: activityTemplates[index % activityTemplates.length],
      cost: destination.avg_cost_per_day,
    }));
  }

  private getActivities(destinationName: string): string[] {
    const templates: Record<string, string[]> = {
      Hunza: [
        'Arrive in Hunza, settle in, and take an easy evening walk around Karimabad.',
        'Visit Altit and Baltit Fort, then explore local cafes and viewpoints.',
        'Spend the day around Attabad Lake with a flexible sightseeing plan.',
      ],
      Skardu: [
        'Land in Skardu or arrive by road and keep the first day light for acclimatization.',
        'Explore Upper Kachura Lake and nearby viewpoints at a relaxed pace.',
        'Take a scenic excursion toward Shigar or the cold desert for photography and local food.',
      ],
      Lahore: [
        'Start with the Walled City, Badshahi Mosque, and an evening food street visit.',
        'Mix museum time, shopping, and a slower cafe stop through Gulberg or MM Alam.',
        'Use the day for heritage sites and a focused local food crawl.',
      ],
      Islamabad: [
        'Ease into the trip with Faisal Mosque, Daman-e-Koh, and a calm city evening.',
        'Visit museums or markets before a sunset trail or Margalla viewpoint.',
        'Keep this day flexible for nearby excursions and travel recovery.',
      ],
      'Swat Valley': [
        'Check into Swat and enjoy a low-effort riverside evening.',
        'Visit Mingora or Malam Jabba depending on the season and road conditions.',
        'Use the day for valley drives, markets, and a relaxed nature stop.',
      ],
      Karachi: [
        'Explore art, food, and a short coastal sunset plan close to the city.',
        'Visit historic districts, cafes, and key city landmarks at a comfortable pace.',
        'Reserve time for markets and a flexible evening dining circuit.',
      ],
    };

    return templates[destinationName] ?? [
      `Explore ${destinationName} at a relaxed pace and keep time for local food and viewpoints.`,
    ];
  }

  private calculateTransportCost(destinationCount: number): number {
    return 6000 + Math.max(0, destinationCount - 1) * 3500;
  }

  private buildSummary(
    destinations: Destination[],
    days: number,
    interests: TravelInterest[],
  ): string {
    const names = destinations.map((destination) => destination.name).join(', ');
    const interestLabel = interests.join(', ');

    return `${days}-day trip focused on ${interestLabel}, covering ${names}.`;
  }
}
