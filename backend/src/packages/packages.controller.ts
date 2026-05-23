import { Controller, Get, Param, Query } from '@nestjs/common';
import { TourPackage } from '@prisma/client';
import { PackagesService } from './packages.service';
import { ListPackagesDto } from './dto/list-packages.dto';
import { QuotePackageDto } from './dto/quote-package.dto';
import { PricingQuote } from '../pricing/pricing.types';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  async findAll(@Query() query: ListPackagesDto): Promise<TourPackage[]> {
    return this.packagesService.findAll(query);
  }

  @Get(':id/quote')
  async quotePackage(
    @Param('id') id: string,
    @Query() query: QuotePackageDto,
  ): Promise<PricingQuote> {
    return this.packagesService.quotePackage(id, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TourPackage> {
    return this.packagesService.findOne(id);
  }
}
