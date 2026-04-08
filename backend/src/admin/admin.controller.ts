import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingStatus, Destination, TourPackage } from '@prisma/client';
import {
  AdminOverview,
  AdminService,
} from './admin.service';
import { CreateDestinationAdminDto } from './dto/create-destination-admin.dto';
import { UpdateDestinationAdminDto } from './dto/update-destination-admin.dto';
import { CreatePackageAdminDto } from './dto/create-package-admin.dto';
import { UpdatePackageAdminDto } from './dto/update-package-admin.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateCustomTripStatusDto } from './dto/update-custom-trip-status.dto';
import { ListPackagesAdminDto } from './dto/list-packages-admin.dto';
import { AdminAuthGuard } from './auth/admin-auth.guard';

interface AdminBookingResponse {
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
}

interface AdminCustomRegistrationResponse {
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
}

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview(): Promise<AdminOverview> {
    return this.adminService.getOverview();
  }

  @Get('destinations')
  async listDestinations(): Promise<Destination[]> {
    return this.adminService.listDestinations();
  }

  @Post('destinations')
  async createDestination(
    @Body() dto: CreateDestinationAdminDto,
  ): Promise<Destination> {
    return this.adminService.createDestination(dto);
  }

  @Patch('destinations/:id')
  async updateDestination(
    @Param('id') id: string,
    @Body() dto: UpdateDestinationAdminDto,
  ): Promise<Destination> {
    return this.adminService.updateDestination(id, dto);
  }

  @Delete('destinations/:id')
  async deleteDestination(@Param('id') id: string): Promise<{ deleted: true }> {
    return this.adminService.deleteDestination(id);
  }

  @Get('packages')
  async listPackages(@Query() query: ListPackagesAdminDto): Promise<TourPackage[]> {
    return this.adminService.listPackages(query);
  }

  @Post('packages')
  async createPackage(@Body() dto: CreatePackageAdminDto): Promise<TourPackage> {
    return this.adminService.createPackage(dto);
  }

  @Patch('packages/:id')
  async updatePackage(
    @Param('id') id: string,
    @Body() dto: UpdatePackageAdminDto,
  ): Promise<TourPackage> {
    return this.adminService.updatePackage(id, dto);
  }

  @Delete('packages/:id')
  async archivePackage(@Param('id') id: string): Promise<TourPackage> {
    return this.adminService.archivePackage(id);
  }

  @Get('bookings')
  async listBookings(): Promise<AdminBookingResponse[]> {
    return this.adminService.listBookings();
  }

  @Patch('bookings/:id/status')
  async updateBookingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<AdminBookingResponse> {
    return this.adminService.updateBookingStatus(id, dto);
  }

  @Get('custom-registrations')
  async listCustomRegistrations(): Promise<AdminCustomRegistrationResponse[]> {
    return this.adminService.listCustomTripRegistrations();
  }

  @Patch('custom-registrations/:id/status')
  async updateCustomRegistrationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCustomTripStatusDto,
  ): Promise<AdminCustomRegistrationResponse> {
    return this.adminService.updateCustomTripStatus(id, dto);
  }
}
