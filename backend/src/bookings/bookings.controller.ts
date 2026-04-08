import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponse } from './booking.types';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() dto: CreateBookingDto): Promise<BookingResponse> {
    return this.bookingsService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookingResponse> {
    return this.bookingsService.findOne(id);
  }
}
