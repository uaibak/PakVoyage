import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import {
  BookingStatus,
  Destination,
  DisplayCurrency,
  PaymentStatus,
  PricingMarket,
  TourPackage,
} from '@prisma/client';
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
import { AdminUploadService } from './admin-upload.service';

interface AdminBookingResponse {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  national_id: string;
  seats: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  total_amount: number;
  pricing_market: PricingMarket;
  display_currency: DisplayCurrency;
  exchange_rate: number;
  display_total: number | null;
  service_cost: number;
  special_requests: string | null;
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
  national_id: string;
  seats: number;
  days: number;
  budget: number;
  interests: string[];
  trip_summary: string;
  destinations: string[];
  estimated_total: number;
  pricing_market: PricingMarket;
  display_currency: DisplayCurrency;
  exchange_rate: number;
  display_total: number | null;
  security_cost: number;
  service_cost: number;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  status: BookingStatus;
  special_requests: string | null;
  created_at: Date;
}

interface UploadResponse {
  urls: string[];
}

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminUploadService: AdminUploadService,
  ) {}

  @Post('uploads')
  @UseInterceptors(
    FilesInterceptor('images', 12, {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_request, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new Error('Only image files can be uploaded.'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadImages(
    @UploadedFiles() files: Array<{
      buffer: Buffer;
      mimetype: string;
      originalname: string;
      size: number;
    }>,
    @Req() request: Request,
  ): Promise<UploadResponse> {
    const paths = await this.adminUploadService.saveUploadedImages(files ?? []);
    const origin = `${request.protocol}://${request.get('host')}`;

    return {
      urls: paths.map((path) => `${origin}${path}`),
    };
  }

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
