import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponse } from './booking.types';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

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

      await tx.tourPackage.update({
        where: { id: travelPackage.id },
        data: {
          available_seats: {
            decrement: dto.seats,
          },
        },
      });

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
          total_amount: travelPackage.price_per_seat * dto.seats,
          special_requests: dto.special_requests,
        },
        include: {
          package: true,
        },
      });

      return booking;
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
