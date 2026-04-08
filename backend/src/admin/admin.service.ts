import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Destination, TourPackage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDestinationAdminDto } from './dto/create-destination-admin.dto';
import { UpdateDestinationAdminDto } from './dto/update-destination-admin.dto';
import { CreatePackageAdminDto } from './dto/create-package-admin.dto';
import { UpdatePackageAdminDto } from './dto/update-package-admin.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateCustomTripStatusDto } from './dto/update-custom-trip-status.dto';
import { ListPackagesAdminDto } from './dto/list-packages-admin.dto';

export interface AdminOverview {
  destinations_count: number;
  packages_count: number;
  active_packages_count: number;
  bookings_count: number;
  pending_bookings_count: number;
  custom_trip_registrations_count: number;
  pending_custom_registrations_count: number;
  confirmed_revenue: number;
}

type AdminBookingListItem = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  seats: number;
  status: BookingStatus;
  total_amount: number;
  created_at: Date;
  package: {
    id: string;
    title: string;
    travel_date: Date;
  };
};

type AdminCustomRegistrationListItem = {
  id: string;
  itinerary_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  seats: number;
  budget: number;
  estimated_total: number;
  status: BookingStatus;
  created_at: Date;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<AdminOverview> {
    const [
      destinationsCount,
      packagesCount,
      activePackagesCount,
      bookingsCount,
      pendingBookingsCount,
      customTripCount,
      pendingCustomTripCount,
      confirmedRevenue,
    ] = await Promise.all([
      this.prisma.destination.count(),
      this.prisma.tourPackage.count(),
      this.prisma.tourPackage.count({ where: { is_active: true } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      this.prisma.customTripRegistration.count(),
      this.prisma.customTripRegistration.count({
        where: { status: BookingStatus.PENDING },
      }),
      this.prisma.booking.aggregate({
        where: { status: BookingStatus.CONFIRMED },
        _sum: { total_amount: true },
      }),
    ]);

    return {
      destinations_count: destinationsCount,
      packages_count: packagesCount,
      active_packages_count: activePackagesCount,
      bookings_count: bookingsCount,
      pending_bookings_count: pendingBookingsCount,
      custom_trip_registrations_count: customTripCount,
      pending_custom_registrations_count: pendingCustomTripCount,
      confirmed_revenue: confirmedRevenue._sum.total_amount ?? 0,
    };
  }

  async listDestinations(): Promise<Destination[]> {
    return this.prisma.destination.findMany({
      orderBy: [{ region: 'asc' }, { name: 'asc' }],
    });
  }

  async createDestination(dto: CreateDestinationAdminDto): Promise<Destination> {
    return this.prisma.destination.create({ data: dto });
  }

  async updateDestination(
    id: string,
    dto: UpdateDestinationAdminDto,
  ): Promise<Destination> {
    await this.ensureDestinationExists(id);
    return this.prisma.destination.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDestination(id: string): Promise<{ deleted: true }> {
    await this.ensureDestinationExists(id);
    const usageCount = await this.prisma.itineraryDay.count({
      where: { destination_id: id },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        'This destination is already used in itineraries and cannot be deleted.',
      );
    }

    await this.prisma.destination.delete({
      where: { id },
    });

    return { deleted: true };
  }

  async listPackages(query: ListPackagesAdminDto): Promise<TourPackage[]> {
    return this.prisma.tourPackage.findMany({
      where: query.include_inactive ? undefined : { is_active: true },
      orderBy: [{ travel_date: 'asc' }, { title: 'asc' }],
    });
  }

  async createPackage(dto: CreatePackageAdminDto): Promise<TourPackage> {
    if (dto.available_seats > dto.total_seats) {
      throw new BadRequestException(
        'Available seats cannot be greater than total seats.',
      );
    }

    return this.prisma.tourPackage.create({
      data: {
        ...dto,
        travel_date: new Date(dto.travel_date),
      },
    });
  }

  async updatePackage(id: string, dto: UpdatePackageAdminDto): Promise<TourPackage> {
    const existing = await this.prisma.tourPackage.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Package with ID "${id}" was not found.`);
    }

    const totalSeats = dto.total_seats ?? existing.total_seats;
    const availableSeats = dto.available_seats ?? existing.available_seats;

    if (availableSeats > totalSeats) {
      throw new BadRequestException(
        'Available seats cannot be greater than total seats.',
      );
    }

    return this.prisma.tourPackage.update({
      where: { id },
      data: {
        ...dto,
        travel_date: dto.travel_date ? new Date(dto.travel_date) : undefined,
      },
    });
  }

  async archivePackage(id: string): Promise<TourPackage> {
    await this.ensurePackageExists(id);
    return this.prisma.tourPackage.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async listBookings(): Promise<AdminBookingListItem[]> {
    return this.prisma.booking.findMany({
      include: {
        package: {
          select: {
            id: true,
            title: true,
            travel_date: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateBookingStatus(
    id: string,
    dto: UpdateBookingStatusDto,
  ): Promise<AdminBookingListItem> {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: {
          package: {
            select: {
              id: true,
              title: true,
              travel_date: true,
            },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID "${id}" was not found.`);
      }

      if (booking.status === dto.status) {
        return booking;
      }

      if (booking.status !== BookingStatus.CANCELLED && dto.status === BookingStatus.CANCELLED) {
        await tx.tourPackage.update({
          where: { id: booking.package_id },
          data: { available_seats: { increment: booking.seats } },
        });
      }

      if (booking.status === BookingStatus.CANCELLED && dto.status !== BookingStatus.CANCELLED) {
        const packageRecord = await tx.tourPackage.findUnique({
          where: { id: booking.package_id },
          select: { available_seats: true },
        });

        if (!packageRecord) {
          throw new NotFoundException(`Package with ID "${booking.package_id}" was not found.`);
        }

        if (packageRecord.available_seats < booking.seats) {
          throw new BadRequestException(
            'Not enough seats available to restore this booking from cancelled state.',
          );
        }

        await tx.tourPackage.update({
          where: { id: booking.package_id },
          data: { available_seats: { decrement: booking.seats } },
        });
      }

      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: dto.status,
        },
        include: {
          package: {
            select: {
              id: true,
              title: true,
              travel_date: true,
            },
          },
        },
      });

      return updatedBooking;
    });
  }

  async listCustomTripRegistrations(): Promise<AdminCustomRegistrationListItem[]> {
    const prismaWithCustomRegistration = this.prisma as PrismaService & {
      customTripRegistration: {
        findMany: (args: {
          orderBy: { created_at: 'desc' };
        }) => Promise<AdminCustomRegistrationListItem[]>;
      };
    };

    return prismaWithCustomRegistration.customTripRegistration.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateCustomTripStatus(
    id: string,
    dto: UpdateCustomTripStatusDto,
  ): Promise<AdminCustomRegistrationListItem> {
    const prismaWithCustomRegistration = this.prisma as PrismaService & {
      customTripRegistration: {
        findUnique: (args: {
          where: { id: string };
        }) => Promise<AdminCustomRegistrationListItem | null>;
        update: (args: {
          where: { id: string };
          data: { status: BookingStatus };
        }) => Promise<AdminCustomRegistrationListItem>;
      };
    };

    const registration = await prismaWithCustomRegistration.customTripRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException(
        `Custom trip registration with ID "${id}" was not found.`,
      );
    }

    return prismaWithCustomRegistration.customTripRegistration.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  private async ensureDestinationExists(id: string): Promise<void> {
    const destination = await this.prisma.destination.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!destination) {
      throw new NotFoundException(`Destination with ID "${id}" was not found.`);
    }
  }

  private async ensurePackageExists(id: string): Promise<void> {
    const travelPackage = await this.prisma.tourPackage.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!travelPackage) {
      throw new NotFoundException(`Package with ID "${id}" was not found.`);
    }
  }
}
