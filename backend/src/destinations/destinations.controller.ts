import { Controller, Get, Param, Query } from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { Destination } from '@prisma/client';
import { ListDestinationsDto } from './dto/list-destinations.dto';
import { QuoteDestinationDto } from './dto/quote-destination.dto';
import { PricingQuote } from '../pricing/pricing.types';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  async findAll(@Query() query: ListDestinationsDto): Promise<Destination[]> {
    return this.destinationsService.findAll(query);
  }

  @Get(':id/quote')
  async quoteDestination(
    @Param('id') id: string,
    @Query() query: QuoteDestinationDto,
  ): Promise<PricingQuote> {
    return this.destinationsService.quoteDestination(id, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Destination> {
    return this.destinationsService.findOne(id);
  }
}
