import { Controller, Get, Param } from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { Destination } from '@prisma/client';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  async findAll(): Promise<Destination[]> {
    return this.destinationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Destination> {
    return this.destinationsService.findOne(id);
  }
}
