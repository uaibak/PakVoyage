import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponse } from './booking.types';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  async create(dto: CreateBookingDto): Promise<BookingResponse> {
    return this.prisma.$transaction(async (tx) => {
      const travelPackage = await tx.tourPackage.findUnique({
        where: { id: dto.package_id },
      });

      if (!travelPackage || !travelPackage.is_active) {
        throw new NotFoundException(`Package with ID "${dto.package_id}" was not found.`);
      }

      if (dto.seats > travelPackage.available_seats) {
        throw new BadRequestException(
          `Only ${travelPackage.available_seats} seat(s) are currently available for this package.`,
        );
      }

      const seatUpdate = await tx.tourPackage.updateMany({
        where: {
          id: travelPackage.id,
          available_seats: {
            gte: dto.seats,
          },
        },
        data: {
          available_seats: {
            decrement: dto.seats,
          },
        },
      });

      if (seatUpdate.count === 0) {
        throw new BadRequestException(
          'Not enough seats are currently available for this package.',
        );
      }

      const pricing = this.pricingService.quotePackageSeat(
        travelPackage.price_per_seat,
        dto.seats,
        dto,
      );

      const booking = await tx.booking.create({
        data: {
          package_id: dto.package_id,
          user_id: dto.user_id,
          full_name: dto.full_name,
          email: dto.email,
          phone: dto.phone,
          national_id: dto.national_id,
          seats: dto.seats,
          status: BookingStatus.PENDING,
          payment_status: dto.payment_status ?? PaymentStatus.UNPAID,
          payment_reference: dto.payment_reference,
          total_amount: pricing.base_total_pkr,
          pricing_market: pricing.market,
          display_currency: pricing.currency,
          exchange_rate: pricing.exchange_rate,
          display_total: pricing.display_total,
          service_cost: pricing.breakdown_pkr.service,
          special_requests: dto.special_requests,
        },
        include: {
          package: true,
        },
      });

      return {
        ...booking,
        pricing,
      };
    });
  }

  async findOne(id: string): Promise<BookingResponse> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        package: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" was not found.`);
    }

    return booking;
  }
}
