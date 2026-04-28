import { Controller, Get, Param, Query } from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { Destination } from '@prisma/client';
import { ListDestinationsDto } from './dto/list-destinations.dto';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  async findAll(@Query() query: ListDestinationsDto): Promise<Destination[]> {
    return this.destinationsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Destination> {
    return this.destinationsService.findOne(id);
  }
}
